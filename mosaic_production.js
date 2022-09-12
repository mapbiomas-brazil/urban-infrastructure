/* 
======================================

### mosaicGen  ###
Origin Collection: 7  

=======================================
*/
//Requires to pre-process Landsat images
var F_PreProcess = require("users/Col7/v0:F_PreProcess_Landsat");
//https://code.earthengine.google.com/eef7d59fdde54723d71b2e9a0d401e22

var F_Indexes = require("users/Col7/v0:F_Indexes_Landsat");
//https://code.earthengine.google.com/3a6b0549bc64301792e6e78e4a65e76e

//Function to obtain the mosaic
var getMosaic = function(year, geometry){

  var BandsSRLT05 = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7']; // surface reflectance - collection 2
  var BandsSRLE07 = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7']; // surface reflectance - collection 2
  var BandsSRLC08 = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7']; // surface reflectance - collection 2
  var BandsSRRename = ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2'];

  var BandsRawLT05 = ['B4', 'B5', 'B6']; // raw image - collection 1
  var BandsRawLE07 = ['B4', 'B5', 'B6_VCID_1']; // raw image - collection 2
  var BandsRawLC08 = ['B5', 'B6', 'B10']; // raw image - collection 2
  var BandsRawRename = ['NIR', 'MIR', 'TIR'];

  var bandsRF = [
                 "BLUE_median"
                 ,"GREEN_median"
                 ,"RED_median"
                 ,"NIR_median"
                 ,"SWIR1_median"
                 ,"SWIR2_median"
                 ,"NDVI_median"
                 ,"EVI_median"
                 ,"EVI2_median"
                 ,"MNDWI_median"
                 ,"NDWIm_median"
                 ,"NDBI_median"
                 ,"NBR_median"
                 ,"NDRI_median"
                 ,"BAI_median"
                 ,"UI_median"
                 ,"NDUI_median"
                 ,"BSI_median"
                 ,"GV_median"
                 ,"NPV_median"
                 ,"SOIL_median"
                 ,"CLOUD_median"
                 ,"GVS_median"
                 ,"SHADE_median"
                 ,"SUBS_median"
                 ,"VEG_median"
                 ,"DARK_median"
                 ,"BU_median"
                 ,"NDFI_median"
                 ,"EVI_p10"
                 ,"EVI_p90"
                 ,"EVI_dif9010"
                 ,"EVI2_p10"
                 ,"EVI2_p90"
                 ,"EVI2_dif9010"
                 ,"EBBI_median"
                 ,"EBBI_p90"
                 ,"EBBI_p25"
                 ,"EBBI_dif7525"
                 ,"EBBIsNeg_median"
                 ,"EBBIsNeg_p75"
                 ,"EBBIsNeg_p25"
                 ,"EBBIsNeg_dif7525"
                 ];

  // Create an image collection from Landsat 5 SR             
  var datasetSR_LT05 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
     .filterDate(year+'-01-01', year+'-12-31')
     .filterBounds(geometry)
     .map(F_PreProcess.maskClouds_QA)
     .map(F_PreProcess.applyScaleFactors);
  //  Map.addLayer (datasetSR_LT05.median(), {}, 'Landsat Col. 2 - SR Median');
  datasetSR_LT05 = datasetSR_LT05.select(BandsSRLT05)
                                 .map(function(image){return image.rename(BandsSRRename)})
                                 .map(function(image){return image.select(BandsSRRename)});
  //  print(datasetSR_LT05.size(), "size of datasetSR_LT05 Clean");
  //  print(datasetSR_LT05.first(), "first of datasetSR_LT05 Clean");
  //  Map.addLayer (datasetSR_LT05, {}, "datasetSR_LT05 Clean");

  // Create an image collection from Landsat 7 SR             
  var datasetSR_LE07 = ee.ImageCollection("LANDSAT/LE07/C02/T1_L2")
     .filterDate(year+'-01-01', year+'-12-31')
     .filterBounds(geometry)
     .map(F_PreProcess.maskClouds_QA)
     .map(F_PreProcess.applyScaleFactors);
  datasetSR_LE07 = datasetSR_LE07.select(BandsSRLE07)
                                 .map(function(image){return image.rename(BandsSRRename)})
                                 .map(function(image){return image.select(BandsSRRename)});
  //  print(datasetSR_LE07.size(), "size of datasetSR_LE07 Clean");
  //  print(datasetSR_LE07.first(), "first of datasetSR_LE07 Clean");
  //  Map.addLayer (datasetSR_LE07, {}, "datasetSR_LE07 Clean");
 
  // Create an image collection from Landsat 8 SR             
  var datasetSR_LC08 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
      .filterDate(year+'-01-01', year+'-12-31')
      .filterBounds(geometry)
      .map(F_PreProcess.maskClouds_QA)
      .map(F_PreProcess.applyScaleFactors);
  datasetSR_LC08 = datasetSR_LC08.select(BandsSRLC08)
                                .map(function(image){return image.rename(BandsSRRename)})
                                .map(function(image){return image.select(BandsSRRename)});
  //  print(datasetSR_LC08.size(), "size of datasetSR_LC08 Clean");
  //  print(datasetSR_LC08.first(), "first of datasetSR_LC08 Clean");
  //  Map.addLayer (datasetSR_LC08, {}, "datasetSR_LC08 Clean");

  var datasetSR = datasetSR_LT05.merge(datasetSR_LE07.merge(datasetSR_LC08));
  //  print(datasetSR.size(), "size of datasetSR Clean");
  //  print(datasetSR.first(), "first of datasetSR Clean");
  //  Map.addLayer (datasetSR, {}, "datasetSR Clean");

  //Merge the image collections from L5, L7 e L8
  var datasetSR_median = datasetSR.reduce(ee.Reducer.median()).multiply(1000).toUint16();
  // Map.addLayer (datasetSR_median, {}, "datasetSR_median");


  // Create an image collection from Landsat 5 RAW             
  var datasetRaw_LT05 = ee.ImageCollection("LANDSAT/LT05/C01/T1")
      .filterDate(year+'-01-01', year+'-12-31')
      .filterBounds(geometry)
      .map(F_PreProcess.maskClouds_BQA);
  //  print(datasetRaw_LT05.size(), "size of datasetRaw_LT05 All");
  //  print(datasetRaw_LT05.first(), "first of datasetRaw_LT05 All");
  //  Map.addLayer(datasetRaw_LT05.first(), {}, "first of datasetRaw_LT05 All");
  datasetRaw_LT05 = datasetRaw_LT05.select(BandsRawLT05)
                                   .map(function(image){return image.rename(BandsRawRename)});
  //  print(datasetRaw_LT05.size(), "size of datasetRaw_LT05 Clean");
  //  print(datasetRaw_LT05.first(), "first of datasetRaw_LT05 Clean");
  //  Map.addLayer(datasetRaw_LT05.first(), {}, "first of datasetRaw_LT05 Clean");
  
  // Create an image collection from Landsat 7 RAW
  var datasetRaw_LE07 = ee.ImageCollection("LANDSAT/LE07/C02/T1")
      .filterDate(year+'-01-01', year+'-12-31')
      .filterBounds(geometry)
      .map(F_PreProcess.maskClouds_QA);
  //  print(datasetRaw_LE07.size(), "size of datasetRaw_LE07 All");
  //  print(datasetRaw_LE07.first(), "first of datasetRaw_LE07 All");
  //  Map.addLayer(datasetRaw_LE07.first(), {}, "first of datasetRaw_LE07 All");
  datasetRaw_LE07 = datasetRaw_LE07.select(BandsRawLE07)
                                   .map(function(image){return image.rename(BandsRawRename)});
  //  print(datasetRaw_LE07.size(), "size of datasetRaw_LE07 Clean");
  //  print(datasetRaw_LE07.first(), "first of datasetRaw_LE07 Clean");
  //  Map.addLayer(datasetRaw_LE07.first(), {}, "first of datasetRaw_LE07 Clean");
  
  // Create an image collection from Landsat 8 RAW
  var datasetRaw_LC08 = ee.ImageCollection("LANDSAT/LC08/C02/T1")
     .filterDate(year+'-01-01', year+'-12-31')
     .filterBounds(geometry)
     .map(F_PreProcess.maskClouds_QA);
  //  print(datasetRaw_LC08.size(), "size of datasetRaw_LC08 All");
  //  print(datasetRaw_LC08.first(), "first of datasetRaw_LC08 All");
  //  Map.addLayer(datasetRaw_LC08.first(), {}, "first of datasetRaw_LC08 All");
  datasetRaw_LC08 = datasetRaw_LC08.select(BandsRawLC08)
                                   .map(function(image){return image.rename(BandsRawRename)});
  //  print(datasetRaw_LC08.size(), "size of datasetRaw_LC08 Clean");
  //  print(datasetRaw_LC08.first(), "first of datasetRaw_LC08 Clean");
  //  Map.addLayer(datasetRaw_LC08.first(), {}, "first of datasetRaw_LC08 Clean");
  
  // Merge the image collections from Landsat raw images
  var datasetRaw = datasetRaw_LT05.merge(datasetRaw_LE07.merge(datasetRaw_LC08));
  //  print(datasetRaw.size(), "size of datasetRaw Clean");
  //  print(datasetRaw.first(), "first of datasetRaw Clean");
  //  Map.addLayer (datasetRaw, {}, "datasetRaw Clean");

  var datasetRaw_median = datasetRaw.reduce(ee.Reducer.median()).multiply(1000).toUint16();
  //  Map.addLayer (datasetRaw_median, {}, "datasetRaw_median");


//Calculate Indexes and add them as bands to the mosaic
  var datasetSR_indexes1 = datasetSR_median
                                .addBands(datasetSR.map(F_Indexes.calcNDVI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcEVI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcEVI2).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcMNDWI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcNDWIm).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcNDBI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcNBR).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16()) 
                                .addBands(datasetSR.map(F_Indexes.calcNDRI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcBAI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcUI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcNDUI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcBSI).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16())
                                .addBands(datasetSR.map(F_Indexes.calcSMA).reduce(ee.Reducer.median()).toUint16()) // frações parecem trocadas
                                .addBands(datasetSR.map(F_Indexes.calcSMASmall).reduce(ee.Reducer.median()).toUint16());
  //  print(datasetSR_indexes1, "datasetSR_indexes1");
  //  Map.addLayer(datasetSR_indexes1, {}, "datasetSR_indexes1");

  var BU = datasetSR.map(F_Indexes.addNDVI).map(F_Indexes.addNDBI);
  BU = BU.map(F_Indexes.calcBU).reduce(ee.Reducer.median()).add(1).multiply(1000).toUint16();
  BU = BU.select("BU_median");
  //  print(BU, "BU");
  //  Map.addLayer(BU, {}, "BU");

  var NDFI = datasetSR.map(F_Indexes.addSMA);
  NDFI = NDFI.map(F_Indexes.calcNDFI).reduce(ee.Reducer.median()).toUint16();
  //  print(NDFI, "NDFI");
  //  Map.addLayer(NDFI, {}, "NDFI");

  var EVI_p= datasetSR.map(F_Indexes.calcEVI).reduce(ee.Reducer.percentile([10,90])).add(1).multiply(1000).toUint16();
  //  print(EVI_p, "EVI_p");
  var EVI_dif9010 = EVI_p.select("EVI_p90").subtract(EVI_p.select("EVI_p10")).rename("EVI_dif9010").toUint16();
  var EVIs = EVI_p.addBands(EVI_dif9010);
  //  Map.addLayer(EVIs, {}, "EVIs");

  var EVI2_p= datasetSR.map(F_Indexes.calcEVI2).reduce(ee.Reducer.percentile([10,90])).add(1).multiply(1000).toUint16();
  //  print(EVI2_p, "EVI2_p");
  var EVI2_dif9010 = EVI2_p.select("EVI2_p90").subtract(EVI2_p.select("EVI2_p10")).rename("EVI2_dif9010").toUint16();
  var EVI2s = EVI2_p.addBands(EVI2_dif9010);
  //  Map.addLayer(EVI2s, {}, "EVI2s");

  var EBBI = datasetRaw.map(F_Indexes.calcEBBI).median().rename("EBBI_median").multiply(1000).toInt16();
  //  Map.addLayer(EBBI, {}, "EBBI");
  var EBBI_p75 = datasetRaw.map(F_Indexes.calcEBBI).reduce(ee.Reducer.percentile([75])).rename("EBBI_p90").multiply(1000).toInt16();
  var EBBI_p25 = datasetRaw.map(F_Indexes.calcEBBI).reduce(ee.Reducer.percentile([25])).rename("EBBI_p25").multiply(1000).toInt16();
  var EBBI_dif7525 = EBBI_p75.subtract(EBBI_p25).rename("EBBI_dif7525").toInt16();
  var EBBIsNeg = datasetRaw.map(F_Indexes.calcEBBI).median().rename("EBBIsNeg_median").multiply(1000).toUint16();
  var EBBIsNeg_p75 = datasetRaw.map(F_Indexes.calcEBBI).reduce(ee.Reducer.percentile([75])).rename("EBBIsNeg_p75").multiply(1000).toUint16();
  var EBBIsNeg_p25 = datasetRaw.map(F_Indexes.calcEBBI).reduce(ee.Reducer.percentile([25])).rename("EBBIsNeg_p25").multiply(1000).toUint16();
  var EBBIsNeg_dif7525 = EBBIsNeg_p75.subtract(EBBIsNeg_p25).rename("EBBIsNeg_dif7525").toUint16();
  var EBBIs = EBBI.addBands(EBBI_p75).addBands(EBBI_p25).addBands(EBBI_dif7525)
                .addBands(EBBIsNeg).addBands(EBBIsNeg_p75).addBands(EBBIsNeg_p25).addBands(EBBIsNeg_dif7525);
  //  print(EBBIs, "EBBIs");
  //  Map.addLayer(EBBIs, viz_EBBI, "EBBIs", false);


  // Create the Final Mosaic 
  var col = datasetSR_indexes1.addBands(BU).addBands(NDFI).addBands(EVIs).addBands(EVI2s).addBands(EBBIs);
  //  print(col, "col");
  //  Map.addLayer(col, {}, "col", true);
 
  return col
}

// Exports the mosaic functions
exports.getMosaic = getMosaic
