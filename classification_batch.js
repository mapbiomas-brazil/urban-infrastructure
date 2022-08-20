/*  
======================================
### Classification Batch ###
Origin Collection: 7

# Notes
- Remember to Change asset path in ExportImage function (assetID)
=======================================
*/

// >>> Adjust the following variables <<< \\
var year = 2018;  

//Info variables
var version = '3'
var Mosaic = "Col7UrbV3_1"

//If any error are found, comment the bands that considers thermal indices
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
               ] 

/*>>>>>>> AUTO-RUN <<<<<<<
1-Abra o console do navegador (botão direito do mouse/inspecionar/aba Console)
2-Cole os blocos de código abaixo (pode travar - divida o listGrid em blocos se necessário)

--------------------------------------------------------------------------------
function runTaskList(){
    // var tasklist = document.getElementsByClassName('task local type-EXPORT_IMAGE awaiting-user-config');
    // for (var i = 0; i < tasklist.length; i++)
    //         tasklist[i].getElementsByClassName('run-button')[0].click();
    $$('.run-button' ,$$('ee-task-pane')[0].shadowRoot).forEach(function(e) {
         e.click();
    })
}
runTaskList();

function confirmAll() {
    // var ok = document.getElementsByClassName('goog-buttonset-default goog-buttonset-action');
    // for (var i = 0; i < ok.length; i++)
    //     ok[i].click();
    $$('ee-table-config-dialog, ee-image-config-dialog').forEach(function(e) {
         var eeDialog = $$('ee-dialog', e.shadowRoot)[0]
         var paperDialog = $$('paper-dialog', eeDialog.shadowRoot)[0]
         $$('.ok-button', paperDialog)[0].click()
    })
}
confirmAll();
--------------------------------------------------------------------------------

*/

print ('>>> ' + Mosaic + " / " + year + ' <<<');

var cartas_hex_col = ee.FeatureCollection("users/mahirye_usp/Cartas_AUXILIAR_cMaskBlocksCol7_4326");
var cartas_col = ee.FeatureCollection("users/mahirye_usp/Cartas_AUXILIAR_cMaskData_4326");
var samples_urban = ee.FeatureCollection("users/Col7/Samples_Train/Urb_Train_Filter/Col7UrbV3_1_TAll_AllSamples_Urb_Filter_" + year);
var samples_nurban = ee.FeatureCollection("users/Col7/Samples_Train/NUrb_Train/Col7UrbV3_1_TAll_AllSamples_NUrb_" + year);

var class_lib = require("users/breno_malheiros/MapBiomas:InfraUrbana-Col7/classification_lib"); 
// Link - https://code.earthengine.google.com/781eea828fbe16e7913e8611529f3a38?noload=true
var mosaicGen = require("users/breno_malheiros/MapBiomas:InfraUrbana-Col7/mosaicGen");          
// Link - https://code.earthengine.google.com/8722ff8c9c1c4ce86c4a09dea5e90cea?noload=true

// 'Carta Internacional do Mundo ao Milionésimo - CIM'
var listGrid = [         
          'NA-19-X-C','NA-19-X-D','NA-19-Y-B','NA-19-Y-D','NA-19-Z-A','NA-19-Z-B','NA-19-Z-C','NA-19-Z-D',
          'NA-20-V-A','NA-20-V-B','NA-20-V-D','NA-20-X-A','NA-20-X-B','NA-20-X-C','NA-20-X-D','NA-20-Y-A','NA-20-Y-C','NA-20-Y-D','NA-20-Z-A','NA-20-Z-B','NA-20-Z-D',
          'NA-21-V-A','NA-21-V-C','NA-21-X-C','NA-21-X-D','NA-21-Y-A','NA-21-Y-C','NA-21-Y-D','NA-21-Z-A','NA-21-Z-B','NA-21-Z-C','NA-21-Z-D',
          'NA-22-V-B','NA-22-V-D','NA-22-X-C','NA-22-Y-A','NA-22-Y-B','NA-22-Y-C','NA-22-Y-D','NA-22-Z-A','NA-22-Z-C','NB-20-Y-C','NB-20-Y-D','NB-20-Z-B','NB-20-Z-C','NB-20-Z-D',
          'NB-21-Y-C',
          'NB-22-Y-D',
          'SA-19-V-D','SA-19-X-A','SA-19-X-B','SA-19-X-D','SA-19-Y-B','SA-19-Y-D','SA-19-Z-A','SA-19-Z-B','SA-19-Z-C','SA-19-Z-D',
          'SA-20-V-A','SA-20-V-B','SA-20-V-C','SA-20-V-D','SA-20-X-A','SA-20-X-B','SA-20-X-C','SA-20-X-D','SA-20-Y-A','SA-20-Y-C','SA-20-Y-D','SA-20-Z-A','SA-20-Z-B','SA-20-Z-C','SA-20-Z-D',
          'SA-21-V-A','SA-21-V-B','SA-21-V-C','SA-21-V-D','SA-21-X-A','SA-21-X-C','SA-21-X-D','SA-21-Y-A','SA-21-Y-B','SA-21-Y-C','SA-21-Y-D','SA-21-Z-A','SA-21-Z-B','SA-21-Z-C','SA-21-Z-D',
          'SA-22-V-A','SA-22-V-B','SA-22-V-C','SA-22-V-D','SA-22-X-A','SA-22-X-B','SA-22-X-C','SA-22-X-D','SA-22-Y-A','SA-22-Y-B','SA-22-Y-C','SA-22-Y-D','SA-22-Z-A','SA-22-Z-B','SA-22-Z-C','SA-22-Z-D',
          'SA-23-V-A','SA-23-V-B','SA-23-V-C','SA-23-V-D','SA-23-X-C','SA-23-Y-A','SA-23-Y-B','SA-23-Y-C','SA-23-Y-D','SA-23-Z-A','SA-23-Z-B','SA-23-Z-C','SA-23-Z-D',
          'SA-24-Y-A','SA-24-Y-B','SA-24-Y-C','SA-24-Y-D','SA-24-Z-C',
          'SB-18-X-D','SB-18-Z-B','SB-18-Z-D',
          'SB-19-V-A','SB-19-V-B','SB-19-V-C','SB-19-X-B','SB-19-X-D','SB-19-Y-A','SB-19-Y-B','SB-19-Y-C','SB-19-Y-D','SB-19-Z-A','SB-19-Z-C','SB-19-Z-D',
          'SB-20-V-A','SB-20-V-B','SB-20-V-D','SB-20-X-A','SB-20-X-B','SB-20-X-C','SB-20-X-D','SB-20-Y-B','SB-20-Y-C','SB-20-Y-D','SB-20-Z-A','SB-20-Z-B','SB-20-Z-C','SB-20-Z-D',
          'SB-21-V-A','SB-21-V-D','SB-21-X-A','SB-21-X-B','SB-21-X-C','SB-21-X-D','SB-21-Y-A','SB-21-Y-B','SB-21-Y-C','SB-21-Y-D','SB-21-Z-A','SB-21-Z-B','SB-21-Z-C','SB-21-Z-D',
          'SB-22-V-A','SB-22-V-B','SB-22-V-C','SB-22-V-D','SB-22-X-A','SB-22-X-B','SB-22-X-C','SB-22-X-D','SB-22-Y-A','SB-22-Y-B','SB-22-Y-C','SB-22-Y-D','SB-22-Z-A','SB-22-Z-B','SB-22-Z-C','SB-22-Z-D',
          'SB-23-V-A','SB-23-V-B','SB-23-V-C','SB-23-V-D','SB-23-X-A','SB-23-X-B','SB-23-X-C','SB-23-X-D','SB-23-Y-A','SB-23-Y-B','SB-23-Y-C','SB-23-Y-D','SB-23-Z-A','SB-23-Z-B','SB-23-Z-C','SB-23-Z-D',
          'SB-24-V-A','SB-24-V-B','SB-24-V-C','SB-24-V-D','SB-24-X-A','SB-24-X-B','SB-24-X-C','SB-24-X-D','SB-24-Y-A','SB-24-Y-B','SB-24-Y-C','SB-24-Y-D','SB-24-Z-A','SB-24-Z-B','SB-24-Z-C','SB-24-Z-D',
          'SB-25-V-C','SB-25-Y-A','SB-25-Y-C',
          'SC-18-X-B','SC-18-X-D',
          'SC-19-V-A','SC-19-V-B','SC-19-V-C','SC-19-V-D','SC-19-X-A','SC-19-X-B','SC-19-X-C','SC-19-X-D','SC-19-Y-B','SC-19-Y-D','SC-19-Z-A','SC-19-Z-B','SC-19-Z-C',
          'SC-20-V-B','SC-20-V-C','SC-20-V-D','SC-20-X-A','SC-20-X-C','SC-20-X-D','SC-20-Y-A','SC-20-Y-B','SC-20-Y-C','SC-20-Y-D','SC-20-Z-A','SC-20-Z-B','SC-20-Z-C','SC-20-Z-D','SC-21-V-B',
          'SC-21-V-C','SC-21-V-D','SC-21-X-B','SC-21-X-C','SC-21-X-D','SC-21-Y-A','SC-21-Y-B','SC-21-Y-C','SC-21-Y-D','SC-21-Z-A','SC-21-Z-B','SC-21-Z-C','SC-21-Z-D',
          'SC-22-V-A','SC-22-V-B','SC-22-V-C','SC-22-V-D','SC-22-X-A','SC-22-X-B','SC-22-X-C','SC-22-X-D','SC-22-Y-A','SC-22-Y-B','SC-22-Y-C','SC-22-Y-D','SC-22-Z-A','SC-22-Z-B','SC-22-Z-C','SC-22-Z-D',
          'SC-23-V-A','SC-23-V-B','SC-23-V-C','SC-23-V-D','SC-23-X-A','SC-23-X-B','SC-23-X-C','SC-23-X-D','SC-23-Y-A','SC-23-Y-B','SC-23-Y-C','SC-23-Y-D','SC-23-Z-A','SC-23-Z-B','SC-23-Z-C','SC-23-Z-D',
          'SC-24-V-A','SC-24-V-B','SC-24-V-C','SC-24-V-D','SC-24-X-A','SC-24-X-B','SC-24-X-C','SC-24-X-D','SC-24-Y-A','SC-24-Y-B','SC-24-Y-C','SC-24-Y-D','SC-24-Z-A','SC-24-Z-B','SC-24-Z-C','SC-24-Z-D',
          'SC-25-V-A','SC-25-V-C',
  /*
          'SD-20-V-B','SD-20-X-A','SD-20-X-B','SD-20-X-C','SD-20-X-D','SD-20-Z-B','SD-20-Z-D',
          'SD-21-V-B','SD-21-V-C','SD-21-V-D','SD-21-X-A','SD-21-X-B','SD-21-X-C','SD-21-X-D','SD-21-Y-A','SD-21-Y-B','SD-21-Y-C','SD-21-Y-D','SD-21-Z-A','SD-21-Z-B','SD-21-Z-C','SD-21-Z-D',
          'SD-22-V-A','SD-22-V-B','SD-22-V-C','SD-22-V-D','SD-22-X-A','SD-22-X-B','SD-22-X-C','SD-22-X-D','SD-22-Y-A','SD-22-Y-B','SD-22-Y-C','SD-22-Y-D','SD-22-Z-A','SD-22-Z-B','SD-22-Z-C','SD-22-Z-D',
          'SD-23-V-A','SD-23-V-B','SD-23-V-C','SD-23-V-D','SD-23-X-A','SD-23-X-B','SD-23-X-C','SD-23-X-D','SD-23-Y-A','SD-23-Y-B','SD-23-Y-C','SD-23-Y-D','SD-23-Z-A','SD-23-Z-B','SD-23-Z-C','SD-23-Z-D',
          'SD-24-V-A','SD-24-V-B','SD-24-V-C','SD-24-V-D','SD-24-X-A','SD-24-X-C','SD-24-Y-A','SD-24-Y-B','SD-24-Y-C','SD-24-Y-D','SD-24-Z-A','SD-24-Z-C',
          'SE-20-X-B',
          'SE-21-V-A','SE-21-V-B','SE-21-V-D','SE-21-X-A','SE-21-X-B','SE-21-X-D','SE-21-Y-B','SE-21-Y-D','SE-21-Z-B','SE-21-Z-D',
          'SE-22-V-A','SE-22-V-B','SE-22-V-C','SE-22-V-D','SE-22-X-A','SE-22-X-B','SE-22-X-C','SE-22-X-D','SE-22-Y-A','SE-22-Y-B','SE-22-Y-C','SE-22-Y-D','SE-22-Z-A','SE-22-Z-B','SE-22-Z-C','SE-22-Z-D',
          'SE-23-V-A','SE-23-V-B','SE-23-V-C','SE-23-V-D','SE-23-X-A','SE-23-X-B','SE-23-X-C','SE-23-X-D','SE-23-Y-A','SE-23-Y-B','SE-23-Y-C','SE-23-Y-D','SE-23-Z-A','SE-23-Z-B','SE-23-Z-C','SE-23-Z-D',
          'SE-24-V-A','SE-24-V-B','SE-24-V-C','SE-24-V-D','SE-24-X-A','SE-24-Y-A','SE-24-Y-B','SE-24-Y-C','SE-24-Y-D',
          'SF-21-V-B','SF-21-V-D','SF-21-X-A','SF-21-X-B','SF-21-X-C','SF-21-X-D','SF-21-Y-B','SF-21-Z-A','SF-21-Z-B','SF-21-Z-C','SF-21-Z-D',
          'SF-22-V-A','SF-22-V-B','SF-22-V-C','SF-22-V-D','SF-22-X-A','SF-22-X-B','SF-22-X-C','SF-22-X-D','SF-22-Y-A','SF-22-Y-B','SF-22-Y-C','SF-22-Y-D','SF-22-Z-A','SF-22-Z-B','SF-22-Z-C','SF-22-Z-D',
          'SF-23-V-A','SF-23-V-B','SF-23-V-C','SF-23-V-D','SF-23-X-A','SF-23-X-B','SF-23-X-C','SF-23-X-D','SF-23-Y-A','SF-23-Y-B','SF-23-Y-C','SF-23-Y-D','SF-23-Z-A','SF-23-Z-B','SF-23-Z-C','SF-23-Z-D',
          'SF-24-V-A','SF-24-V-B','SF-24-V-C','SF-24-Y-A','SF-24-Y-C',
          'SG-21-X-B','SG-21-X-D','SG-21-Z-D',
          'SG-22-V-A','SG-22-V-B','SG-22-V-C','SG-22-V-D','SG-22-X-A','SG-22-X-B','SG-22-X-C','SG-22-X-D','SG-22-Y-A','SG-22-Y-B','SG-22-Y-C','SG-22-Y-D','SG-22-Z-A','SG-22-Z-B','SG-22-Z-C','SG-22-Z-D',
          'SG-23-V-A','SG-23-V-B','SG-23-V-C',
          'SH-21-V-D','SH-21-X-A','SH-21-X-B','SH-21-X-C','SH-21-X-D','SH-21-Y-B','SH-21-Z-A','SH-21-Z-B','SH-21-Z-C','SH-21-Z-D',
          'SH-22-V-A','SH-22-V-B','SH-22-V-C','SH-22-V-D','SH-22-X-A','SH-22-X-B','SH-22-X-C','SH-22-X-D','SH-22-Y-A','SH-22-Y-B','SH-22-Y-C','SH-22-Y-D','SH-22-Z-A','SH-22-Z-C',
          'SI-22-V-A','SI-22-V-B','SI-22-V-C'
    */      
  ]



//Export the mosaic to an asset
var export2col = function(image,grid,roi,year){
  Export.image.toAsset({
      "image": image,
      "description": grid + '-' + year,
      "assetId":'projects/mapbiomas-workspace/TRANSVERSAIS/INFRAURBANA7-PROB/'+ grid + '-' + year ,
      "region": roi,
      "scale": 30,
      "maxPixels": 1e13
  })
};

      
//Processing classification for each listGrid to be exported
listGrid.forEach(function(grid){

    //Select Grids, Blocks and Samples
    var carta_hex = cartas_hex_col.filter(ee.Filter.eq("grid_name", grid));
    //  Map.addLayer(carta_hex, {}, "carta_hex " + grid);
    var carta = cartas_col.filter(ee.Filter.eq("grid_name", grid));
    //  Map.addLayer(carta, {}, "carta " + grid);
  
    var samples_urban_grid = samples_urban.filterBounds(carta_hex);
    //  Map.addLayer(samples_urban_grid, {}, "samples_urban_grid " + grid);
    //  print("size of samples_urban_grid", samples_urban_grid.size());
    var samples_nurban_grid = samples_nurban.filterBounds(carta_hex);
    //  Map.addLayer(samples_nurban_grid, {}, "samples_nurban_grid " + grid);
    //  print("size of samples_nurban_grid", samples_nurban_grid.size());
  
    var samples = samples_urban_grid.merge(samples_nurban_grid)
    
    //Generates a mosaic on the fly
    var mosaic = mosaicGen.getMosaic(year, carta_hex.geometry()).clip(carta_hex.geometry()).select(bandsRF)
    
    //Aplica o classificador
    var classified = class_lib.classifyLandsat(mosaic, samples)
        classified = ee.Image(classified).toUint8();
        //Padrão Workspace
        classified = classified.set('territory', 'BRAZIL')
                               .set('theme', 'Urban Area')
                               .set('version', version)
                               .set('source', 'GT URBANO')
                               .set('collection_id', 7)
                               .set('year', year)
                               .set("grid", grid);
                               
    //print(classified) 
    export2col(classified,grid,carta_hex,year) 
  });
