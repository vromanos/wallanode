const https = require('https');

module.exports = (function () {
 
  const urlHostname = 'es.wallapop.com';
  const urlCategories = 'https://es.wallapop.com/rest/categories';
  const pathItems = '/rest/items?';
  const urlCities = 'https://es.wallapop.com/maps/here/place?placeId=';
  const latitudeMadrid = '40.46943';
  const longitudeMadrid = '-3.64048';
  const distanceDefault = '10'; // Kms

  function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }
 
  return {
 
    showCategories: function () {
      console.log(`### Buscando categorías ... `);
      this.requestUrl(urlCategories).then(categories => {
        if (categories.length > 0) {
          console.log('');
          console.log(`Se han detectado la siguientes categorias:
            `);
          categories.forEach(category => {
            console.log(`CategoryId : ${category.categoryId} - Descripcion: ${category.title} - Productos publicados : ${category.numPublishedItems} - VerticalId : ${category.verticalId}`);
          }); 
        } else {
          console.log(`Error. No se ha encontrado ninguna categoría`);
        }
      });
    },

    searchCoordinates: function (city) {
      console.log(`### Buscando coordenadas de ${city} ... `);
      let url = urlCities + city;
      return new Promise((resolve, reject) => { 
        this.requestUrl(url).then(coordinates => {
          console.log(`Las coordenadas obtenidas son latitud = ${coordinates.latitude} longitud = ${coordinates.longitude}`);
          resolve(coordinates);
        }).catch( err => {
          reject(err);
        });
      });
    },
 
    searchItems: function (city, keywords, category, distance) {
      console.log(`### Buscando productos ... `);
      var composedPath = pathItems + 'orderBy=distance&orderType=asc&_p=1';
      // static params 
      if (keywords) {
        composedPath += `&kws=${keywords}`;
      }
      if (distance) {
        composedPath += `&dist=${distanceDefault}`;
      }
      if (category) {
        composedPath += `&catIds=(${distanceDefault})`;  
      }
      if (city) {
        this.searchCoordinates(city).then(coordinates => {
          composedPath += `&latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;
          const options = {
            hostname: urlHostname,
            port: 443,
            path: composedPath,
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
              'Cookie': `searchLat=${coordinates.latitude};searchLng=${coordinates.longitude}`              
            }
          };
          this.requestUrl(options).then(data => {
            this.showItemsDetails(data.items);
          }).catch( err => {
            console.log('Error obteniendo articulos => ' + err);
          });
        })
      } else {
        composedPath += `&latitude=${latitudeMadrid}&longitude=${longitudeMadrid}`;
        const options = {
          hostname: 'es.wallapop.com',
          port: 443,
          path: composedPath,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
            'Cookie': `searchLat=${latitudeMadrid};searchLng=${longitudeMadrid}`              
          }
        };
        this.requestUrl(options).then(data => {
          this.showItemsDetails(data.items);
        }).catch( err => {
          console.log('Error obteniendo articulos => ' + err);
        });
      }
    },

    showItemsDetails: function (items) {
      items.forEach(item => {
        console.log(`ItemId : ${item.itemId} - title: ${item.title} - Descripcion : ${item.description} - Precio : ${item.price} - Vendedor ${item.sellerUser.microName} (${item.sellerUser.statsUser.selledCount} productos vendidos y ${item.sellerUser.statsUser.receivedReviewsCount} valoraciones)\n`);
      });
    },

    /**
     * Encapsula el procesamiento de una petición https, devolviendo una promesa
     * @param  {String} url Direccion url que se quiere invocar
     * @return {Promise} Promesa en función del resultado
     */
    requestUrl: function (url) {
      return new Promise((resolve, reject) => {
        let json;
        console.log(`=== requestUrl https://${url.hostname}${url.path}`);
        var req = https.get(url, res => {
          // reject on bad status
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('statusCode=' + res.statusCode));
          }
          let data = '';
          res.on('data', chunk => {
            data += chunk;            
          });
          res.on('end', function(){
            try {
              console.log("JSON.parsing...");
              json = JSON.parse(data);
            } catch(e) {
              console.log("La respuesta no tiene formato JSON");
              resolve(data);
            }
            resolve(json);
          });
        }).on('error', function(err) {
          console.log(`Error Request to ${url} => ${err.message}`);
          reject(err);
        });         
      });      
    },
  };
 
})();