require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pool = require('./database/pool');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const svg = require('./database/svg')

app.get('/getSvg/:nome', svg.getSVG);
app.get('/getViewBox/:nome',svg.getViewBox);

// Static
app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/public'));
// Set views
app.set('views', './views');
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.redirect('/Pombal');
});

app.get('/:nome', (req, res) => {

  const municipio = req.params.nome;

  pool.query('SELECT ST_AsSVG(MUN.GEOM) AS MUNSVG, getViewBox(EST.NOME) AS VIEWBOX,\n' +
      'ST_AsSVG(EST.GEOM) AS ESTSVG, MUN.NOME AS MUNOME, EST.NOME AS ESTNOME,\n' +
      'POP.POPULACAO, MUN.SIGLA_UF AS SIGLAUF, MUN.CODIGO AS COD, MUN.AREA_KM2 AS AREA\n' +
      'FROM municipios MUN\n' +
      'INNER JOIN estados EST ON MUN.SIGLA_UF LIKE EST.SIGLA_UF\n' +
      'INNER JOIN populacao POP ON MUN.CODIGO LIKE POP.COD_MUNICIPIO::text\n' +
      'WHERE MUN.NOME ilike $1\n' +
      'AND POP.ANO = 2019', [municipio], (error, results) => {
    if (error) {
      throw error;
    }
    res.render('index', {data: results.rows});
  })
});

app.post('/submit', (req, res) => {
  const municipio = req.body.nome;
  res.redirect('/'+municipio);
});


app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

