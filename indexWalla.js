const process = require('process');
const wallaModule = require('./wallaModule.js');

function bienvenida() {
  
  console.log('########################################')
  console.log(`Bienvenido a la aplicación para consumir la API Rest de Wallapop. Parametros disponibles:`);
  console.log(`\t-categories => lista las categorias disponibles`);
  console.log(`\t-city=xxxxx => indique la ciudad donde desea realizar la búsqueda`);
  console.log(`\t-items=xxxxx => busqueda de artículos por palabras (si varios keywords, concatenarlos con '+')`);
  console.log(`\t-distance=xxxxx => rango (kms) para buscar desde el origen`);
  console.log(`\t-category=xxxxx => categorías donde buscar productos (si mas de una separadas por comas)`);

  if (process.argv.length > 2) {

    // Buscamos los parámetros especificados
    let isShowCategories = false;
    let isSearchItems = false;
    let city;
    let keywords;
    let distance;
    let category;
    process.argv.forEach((val, index, array) => {
      if (index > 1) {
        var key, value;
        if (val.indexOf("=") != -1) {
          key = val.split("=")[0];
          value = val.split("=")[1];
        } else {
          key = val;
        }
        console.log(index + ' : ' + key + (value ? "=" + value : ''));
        if (key === '-categories') {
          isShowCategories = true;
        } else if (key === '-city') {
          city = value;
        } else if (key === '-items') {
          isSearchItems = true;
          keywords = value;
        } else if (key === '-distance') {
          distance = value;
        } else if (key === '-category') {
          category = value;
        }
      }
    });
    console.log('');
    if (isShowCategories) {
      wallaModule.showCategories();
    } else if (isSearchItems) {
      wallaModule.searchItems(city, keywords);
    } else if (city) {      
      wallaModule.searchCoordinates(city);
    }

  } else {
    console.log("Es necesario que especifique al menos un parámetro ('significant', '4.5', '2.0', '1.0')");
    process.exit(1);
  }
}

bienvenida();