<div class="fluid-row" id="header">
    <div id="column">
        <div class = "blocks">
            <img src='Image/LogosMapBiomasUAgroup-rev2.png' height='auto' width='auto' align='right'>
        </div>
    </div>
    <h1 class="title toc-ignore">Urban Area</h1>
</div>

Developed by MapBiomas Urban Area Mapping Group, composed of students and researchers from:
- LabCart <br/>
- LASERE <br/>
- NEEPC <br/>
- NEPA <br/>
- QUAPÁ <br/>
- YBY <br/>
- UFBA <br/>

# About
This repository contains the information used in Mapbiomas Collection 7: Urban Aarea mapping. We strongly recommend reading the Appendix of the Algorithm Theoretical Basis Document (ATBD) for Urban Area, which describes concepts and procedures of  mapping processes. The ATBD file is available on the mapbiomas website. Here, we highlight the useful information to explore and understand our codes in Google Earth Engine (GEE) platform.

# How to use
## Basics
Some basic steps are necessary before starting programming. They are:<br/> 
- Create an account in GEE platform. It can be done here https://earthengine.google.com/<br/>
- Create a GEE repository in the code editor and upload the modules in it. <br/>

The modules necessary are shown in Tables 1 and 2.<br/>

_Table 1 - Basic classification codes._
|Codes| General description
|:---|:---
**preProcessing_lib.js** | Filters Landsat collection scenes and masks clouds and shadows.
**index_lib.js** | Generates a library of images indexes.
**mosaic_production.js** | Generates mosaics from Landsat images from 1985 to 2021.
**class_lib.js** | Sets up a classification procedure using Random Forest (RF) algorithm.
**classification_batch.js** | Applies a classification process using Random Forest (RF) algorithm.
<br/>

_Table 2 - Spatial and temporal classification codes._
|Codes| General description
|:---|:---|
|**best_thresholds.js**| Calculates the bests urban probability to be adopted by the RF results.
|**spatial_filter.js**| Applies morphological operations to obtain the urban areas. Reference maps and the bests probability thresholds are considered.
|**temporal_filter-1.js**| Applies temporal rules over pixels classified as urban areas from spatial filter results.
|**temporal_filter-2.js**| Applies temporal rules over pixels validated as urban areas from the first temporal filter.
|**temporal_filter-3.js**| Applies temporal rules over pixels not classified as urban areas until the second temporal filter.
|**temporal_filter-4.js**| Consolidates the results consdering the previous precessing spteps.
<br/>

## Other information
The Urban Areas reference is selected through land use and land cover samples, composed of randomly distributed points, which contain information (eg, spectral indices) about the class to which they belong.<br>
Considering the wide Brazilian territory, the classification of urban areas requires high computational resources, beyond the available GEE memory limits. <br/>
To solve this problem of the GEE processing limits, the territory was divided into polygons, according to the Millionth Map of the World. These polygons were divided into five groups that can be processed separately. <br/>
Occasionally, failures can occur due to overflowing the memory limit; lack of cloudless images for each year; or for problems related to Landsat 7. For cases of memory extrapolation, the procedure was repeated only for the polygons that presented this problem. The other cases were later corrected using the temporal filters. <br/>
At the end of the basics classification process (ref. Table 1), the classified images corresponding to each polygon composed a single raster file per year where each pixel represents the probability of being an urban area.

# Start the classification process
## Start processing the classification_batch.js script
In this script, a classification process using Random Forest is carried out. All the codes in Table 1 are required. In it, the user must manually change the year variable to generate an image where the pixel value is the urban probability. <br/>
These annual images from 1985 to 2021 will be inserted into an Image Collection, the same one that will be used in the following scripts.

Code: **[classification_batch.js](classification_batch.js)**

## Start spatial filters
Spatial filters combine information in order to improve the classification process considering the urban probability (from Random Forest classification);  the Index of Roads and Infrastrucure (https://doi.org/10.1016/j.jag.2022.102791); monthly average radiance composite images using nighttime data; brazilian census tract (IBGE, 2020), and subnormal settlements (IBGE, 2010 and 2019). A pre-code is applied to get the best probability threshold for each polygon defined by the Millionth Map of the World. The others reference maps operate as boolean layers defining patches where urban areas can be found. This product will be submitted to the temporal filter. <br/>

pre-code: **[best_thresholds.js](best_thresholds.js)**

Code: **[spatial_filter.js](spatial_filter.js)**
<br/>

## Start temporal filter
The temporal filter (TF) consists of a method to improve classification consistency over the years. We developed a set of simple codes applied in a stepwise sense. Each of them operates according to results obtained from the previous one. We encourage you to consider accessing the ATBD documentation to clarify the kernel concept adopted here. The main points of the code are explained in Table 3. <br/>

Both the input asset and the address of the exported images have to be set up into the codes. In general terms, the images from each step result are saved in an Image Collection named as:

String(year) + '-grN_V',  <br/>
where gr = ‘general rule’, N = temporal filter order, and V=version. <br/>

The same Image Collection is used to save all images from TF results. For each case, a list of years is considered as ‘initial years’, ‘mid years’ and ‘last years’. This segmentation is necessary to enable specific consistency rules. <br/>

_Table 3 - Temporal filters._ 
|Codes| Main points of the code|
|:---|:---|
|**[temporal_filter-1.js](temporal_filter-1.js)**| This filter (TF1) considers results from spatial filters. <br/> The image results are saved as String(year) + '-gr1-1'
|**[temporal_filter-2.js](temporal_filter-2.js)**| This filter (TF2) considers results from TF1. <br/> The image results are  saved as String(year) + '-gr2-1'
|**[temporal_filter-3.js](temporal_filter-3.js)**| This filter (TF3) considers results from TF2. <br/> The image results are saved as String(year) + '-gr3-1'
|**[temporal_filter-4.js](temporal_filter-4.js)**| This filter (TF4) considers results from TF3. <br/> The image results are saved as String(year) + '-gr4-1'
<br/>

# Visualization codes
For each filter you can put the map on screen through a simple function exemplified below. You have to define a list of years and also the assets where you saved the results.<br/>

```javascript
var FT_result = "write here the asset address of the image Collection considered"
var years = ["write here the list of years separated by commas"]

var FTn_results = function(year){
  var grN_V = “-gr1-1” 	//Here, write the name of filters result you would like to put in GEE screen
  var img = ee.Image(FT_result + year + grN_V)
  Map.addLayer(img, {bands: "remapped", min: 0, max: 1, palette: [“black”, “red”], opacity: 0.40}, grN_V + “-” +year) //Here you can specify visualizations parameters.
 return

var img = years.map(FTn_results) //Add the map on the screen
```
You can put different results compared and also generate side-by-side results directly on GEE. For this, we encourage the public to consult Google Earth Engine documentation about _linked maps._
