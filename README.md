<div class="fluid-row" id="header">
    <div id="column">
        <div class = "blocks">
            <img src='' height='auto' width='auto' align='right'>
        </div>
    </div>
    <h1 class="title toc-ignore">Urban Area</h1>
</div>

Developed by MapBiomas Urban Area Mapping Group, composed of students and researchers from:
(in development)

# About
This repository contains the information used in Mapbiomas Collection 6: Uurban Aarea mapping. We strongly recommend reading the Appendix of the Algorithm Theoretical Basis Document (ATBD) for Urban Area, which describes concepts and procedures of  mapping processes. Here, we highlight the useful information to explore and to understand our  codes in Google Earth Engine platform.

# How to use
## Basics
Some basic steps are necessary before starting programming. They are:<br/> 
- Create an account in Google Earth Engine (GEE) platform. It can be done here https://earthengine.google.com/<br/>
- Create a GEE repository in the code editor and upload the modules in it. <br/>

The modules necessary are shown in Tables 1 and 2.<br/>

_Table 1 - Classification codes utilized in collection 6._
|Classification codes| Description
|:---|:---
**classification_batch_l5_l7.js** | Generate index mosaics from Landsat 5 and Landsat 7 images. The years are selected manually from 1985 to 2012
**classification_batch_l8.js** | Generate index mosaics from Landsat 8 images. The years are selected manually from 2013 to 2020.
**classification_lib.js** | Applied to classify the mosaic obtained through Random Forest algorithm 
**index_lib.js** | Generates a library of images indexes.
**indexes.js** | Generates a library of images indexes.
**rename_bands.js**| Code to rename bands through classification bachtes codes.
<br/>

_Table 2 - Post classification codes: spatial and temporal filters._
|Post classification codes| Description|
|:---|:---|
|**spatial_filter-1.js**| Morphological operations and general rule to most municipalities
|**spatial_filter-2.js**| Morphological operations and rule for small municipalities
|**merge_collections.js**| Merge collections in order to generate a single image Collection to the nexts steps.
|**temporal_filter-1.js**| It acts on the pixels that were classified as ‘UA’ in the SF results and sets the mask for the filters up to FT3.
|**temporal_filter-2.js**| It acts on pixels that have been validated as ‘UA’ in the TF1 results.
|**temporal_filter-3.js**| It acts on pixels not classified as urban in TF2.
|**temporal_filter-4.js**| Extends the filter mask and acts on pixels not classified as 'UA' in TF3.
|**temporal_filter-5.js**| Area Consolidation Filter.
<br/>

We have also provided a Google Form where users can inform their improvements and bugs identified. Feel free to use it. The link is: https://forms.gle/BJZbeZjYA5prQYACA 

## Other information
Considering that the Brazilian territory is quite extensive, the classification of urban areas requires computational resources beyond the available GEE memory limits. For processing, the Urban Areas reference is selected through land use and land cover samples, composed of randomly distributed points, which contain information (eg., spectral indices) about the class to which they belong. <br/>
To get around the problem of the GEE processing limit, the territory was divided into 439 polygons, according to the Millionth Map of the World. These polygons were divided into five groups that can be processed separately. <br/>
Occasionally, failures can occur due to overflowing the memory limit; lack of cloudless images for each year; or for problems related to Landsat 7. For cases of memory extrapolation, the procedure was repeated only for the polygons that presented this problem. If the fault remained, only Landsat 5 images were used, from 2000 to 2009. The other cases were later corrected in the temporal filter. <br/>
At the end, the classified images corresponding to each polygon composed a single raster file per year, where each pixel represents the probability of being an urban area.

# Start classification
## Start processing the classification_batch_l5_l7.js script (for the years 1985 - 2013)
In this script, the classification process using Random Forest is carried out, using images from 1985 to 2013. In it, the user must manually change the year variable to generate an image of the probability of a given pixel being an urban area. <br/>
These images will be inserted into an Image Collection, the same one that will be used in the following script

## Start processing the classification_batch_l8.js script (for the years 2013 - 2019)
In this script, the classification process is similar to the one presented above, but for the period from 2014 to 2020. At the end, the Image Collection will contain probability images for all the years of interest.

## Start spatial filters
Spatial filters operate by combining information in order to generate a post-classification imagery, considering probability to be urban (from Random Forest classification); presence of population and nighttime lights map. Thresholds were established for these data as explained in ATBD and shown in Tables 3 and 4. 
The small municipalities considered are presented in spatial filter 2 code. There is possible to catch the ‘territories code’ as considered by IBGE documents. You can access them here https://www.ibge.gov.br/explica/codigos-dos-municipios.php.

_Table 3 - Spatial filter 1 - General rule to most municipalities._
Threshold | Probability | Population | Nightlight
:---| :---| :---| :---
low | 50| 1.5 | 3 
medium | 70| -- | 10 
high | 95| 50 | 40 
<br/>

**Code: spatial_filter-1.js**

_Table 4 - Spatial filter 2 - Rule for small municipalities._
Threshold | Probability | Population | Nightlight
:---| :---| :---| :---
low | --| 1.5 | -- 
medium | 50| -- | -- 
high | --| 50 | --
<br/>

**Code: spatial_filter-2.js** 

merge_collections.jsThe results from each spatial filter are saved in an image Collection that you can specify. However, It is important to consider an asset that you can save all the images to the nexts steps. You need to create this collection in advance then you can save the images there. If it is the case, you can also merge different collections using a ‘merge_collection.js’ code as we have done:    

**Code: merge_collections.js**

In this script, the addresses of image collections used in the spatial filters in the variables img1 and img2 are indicated. Then the script will join the products of each spatial filter iterating by year. <br/>
The result is an image collection containing large and small municipalities. This product will be submitted to the temporal filter

## Start temporal filter
The temporal filter consists of a method to improve classification consistency over the years. We developed an array of simple codes applied in a stepwise sense. Each of them operates according to results obtained from the previous one. We encourage you to consider accessing the ATBD documentation to clarify the kernel concept adopted here. The main points of the code are explained in Table 5. <br/>

Both the input asset and export image address have to be adjusted to each user and team. In general terms, the images from each step result are saved in an Image Collection named as:

String(year) + '-grN_V',  <br/>
where gr = ‘general rule’, N = temporal filter order, and V=version.

The same Image Collection is used to save all images from TF results. For each case, a list of years is considered as ‘initial years’, ‘mid years’ and ‘last years’. This segmentation is necessary to enable specific consistency rules.

_Table 5 - Temporal filters._ 
|Codes| Main points of the code|
|:---|:---|
|**temporal-filter-1.js**| This filter (TF1) considers results from spatial filters. <br/> The image results are saved as String(year) + '-gr1-1'
|**temporal_filter-2.js**| This filter (TF2) considers results from TF1. <br/> The image results are  saved as String(year) + '-gr2-1'
|**temporal_filter-3.js**| This filter (TF3) considers results from TF2. <br/> The image results are saved as String(year) + '-gr3-1'
|**temporal_filter-4.js**| This filter (TF4) considers results from TF3. <br/> The image results are saved as String(year) + '-gr4-1'
|**temporal_filter-5.js**| This filter (TF5) considers results from TF4. <br/> The image results are saved as String(year) + '-gr5-1'
<br/>

# Visualization codes
For each filter you can put the map on screen through a simple function exemplified below. You have to define a list of years and also the assets where you saved the results.

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
You can put different results compared and also generate side-by-side results directly on GEE. For this, we encourage the public to consult Google Earth Engine documentation about _linked maps.
