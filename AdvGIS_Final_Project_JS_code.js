//// UC San Diego School of Global Policy and Strategy
//// Advanced GIS and Remote Sensing
//// Winter 2017, Final Project
//// Anton Prokopyev

//// Created in Google Earth Engine Coder

/////////////////////////////////////////////////////////////
////////////////////// PRELIMINARY //////////////////////////
/////////////////////////////////////////////////////////////

/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageCollection2 = ee.ImageCollection("LANDSAT/LT5_L1T_32DAY_NDVI"),
    treeimage = ee.Image("UMD/hansen/global_forest_change_2014"),
    treecover = {"opacity":1,"bands":["treecover2000"],"max":84,"gamma":1},
    farms = /* color: #98ff00 */ee.Geometry.MultiPolygon(
        [[[[-115.8343505859375, 33.17893926058104],
           [-115.83984375, 33.09614359735857],
           [-115.77392578125, 33.08693925905123],
           [-115.6585693359375, 32.934928669082325],
           [-115.8233642578125, 32.8149783969858],
           [-115.697021484375, 32.60698915452777],
           [-115.2191162109375, 32.648625783736726],
           [-115.279541015625, 32.98562797456918],
           [-115.4443359375, 33.243281858479484],
           [-115.6201171875, 33.3442960191357]]],
         [[[-115.93597412109375, 33.52307880890422],
           [-116.19964599609375, 33.78143022380356],
           [-116.52099609375, 33.86585445407186],
           [-116.4056396484375, 33.68549637289138],
           [-116.03759765625, 33.37641235124676]]],
         [[[-116.729736328125, 32.55607364492026],
           [-116.9549560546875, 33.192730941906945],
           [-116.65283203125, 33.22030778968541],
           [-116.663818359375, 33.32134852669881],
           [-116.982421875, 33.47727218776036],
           [-117.09228515625, 33.43144133557529],
           [-117.169189453125, 33.30298618122413],
           [-117.257080078125, 33.17434155100208],
           [-117.103271484375, 33.10074540514424],
           [-117.1142578125, 32.97180377635759],
           [-116.949462890625, 32.54681317351514]]],
         [[[-121.4060073570804, 35.7677240955711],
           [-120.74808047065363, 35.05269720460449],
           [-120.45198788592324, 35.088594081581874],
           [-120.15589750545234, 35.23204027157003],
           [-119.8817387056497, 35.124482029768494],
           [-118.79584934324373, 34.976185241271835],
           [-119.03740780029563, 35.25435944195546],
           [-119.958505520838, 35.24995503975663],
           [-120.21072904578568, 35.330512083614025],
           [-120.22169573326772, 35.527094502397524],
           [-120.48488025446147, 35.52709560578559],
           [-120.47391708762098, 35.33051305661337],
           [-120.59454514512703, 35.32156752435901],
           [-121.15378693255269, 35.8655256446833]]],
         [[[-119.56410564961072, 34.415857063356015],
           [-119.5091575882164, 34.57897711998968],
           [-119.5531205264507, 34.822954090283154],
           [-120.5862897082394, 34.868054520158495],
           [-120.47637454201788, 34.470311989085694]]],
         [[[-118.80055730611844, 34.00316095933824],
           [-118.4765625, 34.07996230865873],
           [-118.62472626807306, 34.18899174166921],
           [-118.6083984375, 34.35704160076073],
           [-119.15771484375, 34.4069096565206],
           [-119.234619140625, 34.125447565116126]]],
         [[[-118.96582369028278, 35.39364628618588],
           [-119.07017555707421, 35.101945517686836],
           [-117.16327379199117, 34.65110333921885],
           [-117.07534069269593, 34.9309182239797]]],
         [[[-119.92518925926339, 35.78554465279492],
           [-119.81018336442867, 35.54526637981978],
           [-119.97449432329665, 35.44270885706366],
           [-119.87043564625526, 35.331077217147815],
           [-119.72803307210245, 35.34001114781616],
           [-119.62944735375714, 35.21928957358303],
           [-119.02149384058316, 35.26403393498177],
           [-118.77508037971069, 35.86993272013171]]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

//// Fusion Tables Links ////
// States
// https://fusiontables.google.com/data?docid=17aT9Ud-YnGiXdXEJUyycH2ocUqreOeKGbzCkUw
// Counties
// https://fusiontables.google.com/data?docid=1xdysxZ94uUFIit9eXmnw1fYc6VcQiXhceFd_CVKa

/////////////////////////////////////////////////////////////
/////////////////////////// SETUP ///////////////////////////
/////////////////////////////////////////////////////////////

// Go to Southern California
Map.setCenter(-117,34, 8);

// Get all counties from the table
var counties = ee.FeatureCollection('ft:1xdysxZ94uUFIit9eXmnw1fYc6VcQiXhceFd_CVKa', 'geometry');
var c01 = counties.filterMetadata('State-County', 'equals', 'CA-San Bernardino');
var c02 = counties.filterMetadata('State-County', 'equals', 'CA-Kern');
var c03 = counties.filterMetadata('State-County', 'equals', 'CA-San Luis Obispo');
var c04 = counties.filterMetadata('State-County', 'equals', 'CA-Santa Barbara');
var c05 = counties.filterMetadata('State-County', 'equals', 'CA-Ventura');
var c06 = counties.filterMetadata('State-County', 'equals', 'CA-Los Angeles');
var c07 = counties.filterMetadata('State-County', 'equals', 'CA-Orange');
var c08 = counties.filterMetadata('State-County', 'equals', 'CA-Riverside');
var c09 = counties.filterMetadata('State-County', 'equals', 'CA-San Diego');
var c10 = counties.filterMetadata('State-County', 'equals', 'CA-Imperial');

// Merge all counties into one Southern California region
var cali =  c01.merge(c02).merge(c03).merge(c04).merge(c05).merge(c06).merge(c07).merge(c08).merge(c09).merge(c10);

/////////////////////////////////////////////////////////////
///////////////////////// GET DATA //////////////////////////
/////////////////////////////////////////////////////////////

// Collections of images from Landsat 5 & 8
var LS5 = ee.ImageCollection('LANDSAT/LT5_L1T_32DAY_NDVI')
  .filterDate('1984-01-01', '2013-01-01')
//  .select(bands2010);
var LS8 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_NDVI')
  .filterDate('2013-01-01', '2017-04-07')
//  .select(bands2015);

//  Mean-pixel composites 
var meanLS5 = LS5.mean();
var meanLS8 = LS8.mean();

// Clip Landsat composites by SoCal boundaries
var clippedLS5 = meanLS5.clip(cali);
var clippedLS8 = meanLS8.clip(cali);

// NDVI < 0 == water. Exclude it from analysis
var landLS5 = clippedLS5.gt(0);
var landLS8 = clippedLS8.gt(0);

// Mask NDVI to just the land areas.
clippedLS5 = clippedLS5.mask(landLS5);
clippedLS8 = clippedLS8.mask(landLS8);

// Display images
var ndviParams = {palette: ['blue', 'white', 'green']};
var vizParamsLS5 = {min: 0, max: 0.5, palette: ['blue', 'white', 'green']};
var vizParamsLS8 = {min: 0, max: 0.5, palette: ['blue', 'white', 'green']};

Map.addLayer(clippedLS5, vizParamsLS5, "Landsat 5 1984-2012 average");
Map.addLayer(clippedLS8, vizParamsLS8, "Landsat 8 2013-2016 average");

////////////////////////////////////////////////////////////////////
/////////////////////////// ANALYSIS ///////////////////////////////
////////////////////////////////////////////////////////////////////

// Reduce the collection with a stdDev reducer.
var stdev = LS5.reduce(ee.Reducer.stdDev());
var mean = LS5.reduce(ee.Reducer.mean());
var image = LS8.reduce(ee.Reducer.mean());
// Calc Z Scores
var zscorestep1 = image.subtract(mean)
var zscore = zscorestep1.divide(stdev)
// Display the StDev image.
var ndviParams = {palette: ['brown', 'white', 'green']};
Map.addLayer(zscore.clip(cali).mask(landLS8), ndviParams, "NDVI changes");


// Calculate fallowed area by pixel (0 if pixel was not fallowed)
var dried = zscore.lt(-0.25);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print(totalDriedArea);

var dried = zscore.lt(-0.5);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print(totalDriedArea);

var dried = zscore.lt(-1);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print(totalDriedArea);

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// IMAGE EXPORT //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Export.image.toDrive(
{image: clippedLS5,
description: 'Landsat_5_1984_2012',
fileNamePrefix: 'Landsat_5_1984_2012',
region: region,
scale: 200
})
//////////ArcMap Code to replace values: Con("Landsat_5_1984_2012.tif" <= 0.001, 0 , "Landsat_5_1984_2012.tif") ////////

Export.image.toDrive(
{image: clippedLS8,
description: 'Landsat_8_2013_2016',
fileNamePrefix: 'Landsat_8_2013_2016',
region: region,
scale: 200
})
//////////ArcMap Code to replace values: Con("Landsat_8_2013_2016.tif" <= 0.001, 0 , "Landsat_8_2013_2016.tif") ////////

Export.image.toDrive(
{image: zscore.clip(cali).mask(landLS8),
description: 'Dried_land_2013_2016',
fileNamePrefix: 'Dried_land_2013_2016',
region: region,
scale: 200
})
//////////ArcMap Code to replace values: Con("Dried_land_2013_2016.tif" <= 0.001, 0 , "Landsat_8_2013_2016.tif") ////////

////////////////////////////////////////////////////////////////////////////
////////////////////////////REDO FOR YEARS OF INTEREST////////////////////// 
////////////////////////////////////////////////////////////////////////////

var LS8y2013 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_NDVI')
  .filterDate('2013-01-01', '2013-12-31')
var LS8y2014 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_NDVI')
  .filterDate('2014-01-01', '2014-12-31')
var LS8y2015 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_NDVI')
  .filterDate('2015-01-01', '2015-12-31')
var LS8y2016 = ee.ImageCollection('LANDSAT/LC8_L1T_32DAY_NDVI')
  .filterDate('2016-01-01', '2016-12-31')

// Create mean-pixel composites for each of the study years
var meanLS8y2013 = LS8y2013.mean();
var meanLS8y2014 = LS8y2014.mean();
var meanLS8y2015 = LS8y2015.mean();
var meanLS8y2016 = LS8y2016.mean();
// Clip Landsat composite by California state boundary.
var clippedLS8y2013 = meanLS8y2013.clip(cali);
var clippedLS8y2014 = meanLS8y2014.clip(cali);
var clippedLS8y2015 = meanLS8y2015.clip(cali);
var clippedLS8y2016 = meanLS8y2016.clip(cali);

// Land loss 2013
var zscorestep1 = clippedLS8y2013.subtract(mean)
var zscore = zscorestep1.divide(stdev)
Map.addLayer(zscore.clip(cali).mask(landLS8), ndviParams, "NDVI changes 2013 vs Average");
var dried = zscore.lt(-0.25);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2013, -0.25 th")
print(totalDriedArea);
var dried = zscore.lt(-0.5);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2013, -0.5 th")
print(totalDriedArea);
var dried = zscore.lt(-1);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2013, -1 th")
print(totalDriedArea);

// Difference from historical mean 2014
var zscorestep1 = clippedLS8y2014.subtract(mean)
var zscore = zscorestep1.divide(stdev)
Map.addLayer(zscore.clip(cali).mask(landLS8), ndviParams, "NDVI changes 2014 vs Average");
// Land loss 2014
var dried = zscore.lt(-0.25);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2014, -0.25 th")
print(totalDriedArea);
var dried = zscore.lt(-0.5);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2014, -0.5 th")
print(totalDriedArea);
var dried = zscore.lt(-1);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2014, -1 th")
print(totalDriedArea);

// Land loss 2015
var zscorestep1 = clippedLS8y2015.subtract(mean)
var zscore = zscorestep1.divide(stdev)
Map.addLayer(zscore.clip(cali).mask(landLS8), ndviParams, "NDVI changes 2015 vs Average");
var dried = zscore.lt(-0.25);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2015, -0.25 th")
print(totalDriedArea);
var dried = zscore.lt(-0.5);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2015, -0.5 th")
print(totalDriedArea);
var dried = zscore.lt(-1);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2015, -1 th")
print(totalDriedArea);

// Land loss 2016
var zscorestep1 = clippedLS8y2016.subtract(mean)
var zscore = zscorestep1.divide(stdev)
Map.addLayer(zscore.clip(cali).mask(landLS8), ndviParams, "NDVI changes 2016 vs Average");
var dried = zscore.lt(-0.25);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2016, -0.25 th")
print(totalDriedArea);
var dried = zscore.lt(-0.5);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2016, -0.5 th")
print(totalDriedArea);
var dried = zscore.lt(-1);
var areaImageSqM = ee.Image.pixelArea().clip(region);
var areaImageSqKm = areaImageSqM.multiply(0.000001);
var driedArea = dried.multiply(areaImageSqKm);
var totalDriedArea = driedArea.reduceRegion(ee.Reducer.sum(), farms, 200);
print("Land loss 2016, -1 th")
print(totalDriedArea);

/////////////////////////////////////////////////////////////
///////////////////// Visualizations ////////////////////////
/////////////////////////////////////////////////////////////

// See below.

/////////////////////////////////////////////////////////////
//////////////// Time-Series Chart of NDVI //////////////////
/////////////////////////////////////////////////////////////

// Collections of images from Landsat 5 & 8
var LS5 = ee.ImageCollection('LANDSAT/LT5_L1T_ANNUAL_NDVI')
  .filterDate('1984-01-01', '2013-01-01')
//  .select(bands2010);
var LS8 = ee.ImageCollection('LANDSAT/LC8_L1T_ANNUAL_NDVI')
  .filterDate('2013-01-01', '2017-04-07')
//  .select(bands2015);

var chartOptions=
{
title: 'NDVI of SoCal over time',
hAxis: {title: 'Year'},
vAxis: {title: 'NDVI'},
lineWidth: 1,
pointSize: 4,
};

print(ui.Chart.image.series({
  imageCollection: LS5, 
  region: region, 
  reducer: ee.Reducer.mean(), 
  scale: 200
}).setOptions(chartOptions));

print(ui.Chart.image.series({
  imageCollection: LS8, 
  region: region, 
  reducer: ee.Reducer.mean(), 
  scale: 200
}).setOptions(chartOptions));

/////////////////////////////////////////////////////////////
////////////////////// Histograms ///////////////////////////
/////////////////////////////////////////////////////////////

var ndviParams = {palette: 'FF0000, 000000, 00FF00', min: -0.5, max: 0.5};

// Preset customization options for histogram
var histoptions = {
  title: 'Landsat 5 NDVI histogram, 1984 - 2012',
  fontSize: 14,
  hAxis: {title: 'NDVI'},
  vAxis: {title: 'Count'}
};

// Draw the LS5 histogram using options
var histogram = ui.Chart.image.histogram(clippedLS5, region, 200)
    .setOptions(histoptions);
print(histogram);

var histoptions = {
  title: 'Landsat 8 NDVI histogram, 2013 - 2016',
  fontSize: 14,
  hAxis: {title: 'NDVI'},
  vAxis: {title: 'Count'}
};

// Draw the LS8 histogram using options
var histogram = ui.Chart.image.histogram(clippedLS8, region, 200)
    .setOptions(histoptions);
print(histogram);

var histoptions = {
  title: 'Distribution of NDVI z-Scores, 2013-2016',
  fontSize: 14,
  hAxis: {title: 'NDVI z-Scores'},
  vAxis: {title: 'Count'}
};

// Draw Z-Score histogram
var histogram = ui.Chart.image.histogram(zscore, region, 200)
    .setOptions(histoptions);
print(histogram);

////////////////////////////////////////////////////////////////////
//////////////////////////// Sources ///////////////////////////////
////////////////////////////////////////////////////////////////////

/// https://4aa2dc132bb150caf1aa-7bb737f4349b47aa42dce777a72d5264.ssl.cf5.rackcdn.com/map_california300.jpg
/// https://landsat.gsfc.nasa.gov/landsat-8/landsat-8-bands/
/// https://blog.webkid.io/analysing-satellite-images-with-google-earth-engine/
/// https://github.com/brmagnuson/LandFallowingInEarthEngine

////////////////////////////////////////////////////////////////////
/////////////////////// Deprecated code ////////////////////////////
////////////////////////////////////////////////////////////////////

// Use an equals filter to define how the collections match.
//var filter = ee.Filter.equals({
//  leftField: 'system:index',
//  rightField: 'system:index'
//});
//
// Create the join.
//var simpleJoin = ee.Join.simple();
//
// Apply the join.
//var simpleJoined = simpleJoin.apply(LS5, LS8, filter);
//
//print('LS5: ', LS5);
//print('LS8: ', LS8);
//print('Simple join: ', simpleJoined);

// Bands for analysis 
//var bandsLS5 = ['B1', 'B2', 'B3', 'B4', 'B5', 'B7'];
//var bandsLS8 = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B10', 'B11'];

//var ndviDifference = clippedLS8.subtract(clippedLS5);
//Map.addLayer(ndviDifference, ndviParams, "2013-2016 vs Average");

// Subtract the forests
//var minusforest = zscore.subtract(treeimage)
//Map.addLayer(minusforest.clip(cali).mask(landLS8));