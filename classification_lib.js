/* 
======================================
### Classification Library  ###
Origin Collection: 5
Revision: 7
# Notes
- Remember to Change asset path in ExportImage function (assetID)
=======================================
*/
//Prepare the training samples
var getFeatureSpace = function(image, samples){
 
  samples = image.sampleRegions({
    collection:samples,
    scale:30,
    geometries:true,
    tileScale:16
    });
  return ee.FeatureCollection(samples);
};
//Classifier
var runRandomForest = function(ntree, image, samples){
  //Train the classifier
  var classifier = ee.Classifier.smileRandomForest({
                    numberOfTrees:ntree,
                    minLeafPopulation:20,
                    seed: 24
                    })
                    .train({
                      'features':samples,
                      'classProperty':'value',
                      'inputProperties':image.bandNames()
                    })
                    .setOutputMode('PROBABILITY');
  //Classify the mosaic
  var classified = image.classify(classifier);
  
  return classified;
  
};
//Runs the classification
var classifyLandsat = function(image, samples){
  var classified = runRandomForest(500, image, samples);
  return classified.multiply(100).byte();
  
}; 
////////////////////////////////////////////////////////////
exports.classifyLandsat = classifyLandsat;
exports.getFeatureSpace = getFeatureSpace;
exports.runRandomForest = runRandomForest;
