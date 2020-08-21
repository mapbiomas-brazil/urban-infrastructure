var years = [1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
    2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,
    2013,2014,2015,2016,2017,2018,2019];
    
var geometry =  ee.Geometry.Polygon(
        [[[-77.50171350239748, 6.5025740143888955],
          [-77.50171350239748, -35.664852805616775],
          [-34.08374475239747, -35.664852805616775],
          [-34.08374475239747, 6.5025740143888955]]], null, false);
var img_0 = ee.Image(0).clip(geometry);  

var img = ee.Image('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/INFRAURBANA5-PC-V6/1985')
            .select(['classification'],['classification_' + String(1985)])
            .unmask(img_0)


years.forEach(function(item){
var infra =  ee.Image('projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5/INFRAURBANA5-PC-V6/' + String(item))
          .select(['classification'],['classification_' + String(item)]).unmask(img_0);

        img = img.addBands(infra)

})

var toImageCollection = function(image){
    var bandNamesList = image.bandNames();
    var imc = bandNamesList.map(function(name){
        var year = ee.String(name).slice(15);
        var img = image.select([name])
            .set('band_name',name)
            .set('year',year)
            .set('system:time_start', year.cat(ee.String('-01-01')))
            .rename('classification');
        return img;
});

    return ee.ImageCollection.fromImages(imc);
};

var ImcToImage = function(imc){

    var first_image = ee.Image(imc.first());

    var image = ee.Image(imc.iterate(function(img, prev){

        img = ee.Image(img).select('classification');
        var year = ee.String(img.get('year'));
        img = ee.Image(prev).addBands(img.rename(ee.String('classification_').cat(year)));

    return img;

    }, first_image) );

    image = image.select(image.bandNames().remove('classification'));

    return image;

};
var remapCloud = function(imc){

    var first_image = ee.Image(imc.first());
    first_image = first_image.addBands({
    srcImg:first_image.rename(ee.String('classification_prev'))
    });

    var image_ft = ee.Image(imc.iterate(function(img, prev){

        var img_ = ee.Image(img).select('classification');
        var prev_ = ee.Image(prev).select('classification_prev');
        var year = ee.String(img_.get('year'));

        var image_result = img_.where(prev_.eq(24).and(img_.eq(0)), 24).rename(ee.String('classification_').cat(year));

        var image_final = ee.Image(prev).addBands(image_result);

        image_final = image_final.addBands({
        srcImg:image_result.rename(ee.String('classification_prev')),
        overwrite:true
        });

        return image_final;

    }, first_image) );

    return image_ft.select(image_ft.bandNames().remove('classification').remove('classification_prev'));

};
var applyFilterCloud = function(image){
        var imc = toImageCollection(image).sort('year');
        
        image = remapCloud(imc);
        return image

};

img = img.select(
        ['classification_1985',
        'classification_1986',
        'classification_1987',
        'classification_1988',
        'classification_1989',
        'classification_1990',
        'classification_1991',
        'classification_1992',
        'classification_1993',
        'classification_1994',
        'classification_1995',
        'classification_1996',
        'classification_1997',
        'classification_1998',
        'classification_1999',
        'classification_2000',
        'classification_2001',
        'classification_2002',
        'classification_2003',
        'classification_2004',
        'classification_2005',
        'classification_2006',
        'classification_2007',
        'classification_2008',
        'classification_2009',
        'classification_2010',
        'classification_2011',
        'classification_2012',
        'classification_2013',
        'classification_2014',
        'classification_2015',
        'classification_2016',
        'classification_2017',
        'classification_2018',
        'classification_2019']
);

var imgFilters = applyFilterCloud(img)


var biome = null; //configure como null se for tema transversal
var version = '7';
var collection = 5.0;
var source = 'terras app solutions';
var theme = 'INFRAURBANA'; // configure com o nome do tema em maiusculo se for tema transversal (ex: AGRICULTURA, MINERACAO)
var outputAsset = 'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA5-FT';
imgFilters
  .bandNames()
  .evaluate(
    function (bandNames) {
      //print('bandNames',bandNames)
      bandNames.forEach(
          function (band) {
    
              var year = band.split('_')[1];
              
              //print('year',year)
    
              var imageYear = imgFilters.select([band], ['classification']);
             
              imageYear = imageYear
                  .set('theme', theme)
                  .set('year', parseInt(year, 10))
                  .set('version', version)
                  .set('collection', collection)
                  .set('source', source)
                  .set('system:index','classification_' + String(year))
    
              var name = year + '-' + version;
             //Map.addLayer(imageYear, {min:0, max:24, palette: [dicColor[parseInt(year)],'#7FFF00']}, name)
              //print('imageYear evaluate',imageYear)
             Export.image.toAsset(
                  {
                      image: imageYear.byte(),
                      description: name,
                      assetId: outputAsset + '/' + name,
                      pyramidingPolicy: {
                          '.default': 'mode'
                      },
                      region: geometry,
                      scale: 30,
                      maxPixels: 1e13
                  }
              );
          }
      );
    
    }
    );


