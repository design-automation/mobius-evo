/**
 * to use this code: import eaEval from this js file as well as the GI module
 * run eaEval with the GI module as input along with other start node input
 * e.g.:
 * const eaEval = require('./eaEval.js').eaEval
 * const module = require('gi-module')
 * const result = await eaEval(module, start_input_1, start_input_2, ...);
 *
 * returns: a json object:
 *   _ result.model -> gi model of the flowchart
 *   _ result.result -> returned output of the flowchart, if the flowchart does not return any value, result.result is the model of the flowchart
 */



async function eaEval(__modules__) {

var __debug__ = true;
var __model__ = null;
/** * **/
var PI = __modules__._constants.PI;
var XY = __modules__._constants.XY;
var YZ = __modules__._constants.YZ;
var ZX = __modules__._constants.ZX;
var YX = __modules__._constants.YX;
var ZY = __modules__._constants.ZY;
var XZ = __modules__._constants.XZ;
var isNum = __modules__._types.isNum;
var isInt = __modules__._types.isInt;
var isFlt = __modules__._types.isFlt;
var isBool = __modules__._types.isBool;
var isStr = __modules__._types.isStr;
var isList = __modules__._types.isList;
var isDict = __modules__._types.isDict;
var isVec2 = __modules__._types.isVec2;
var isVec3 = __modules__._types.isVec3;
var isCol = __modules__._types.isCol;
var isRay = __modules__._types.isRay;
var isPln = __modules__._types.isPln;
var isNaN = __modules__._types.isNaN;
var isNull = __modules__._types.isNull;
var isUndef = __modules__._types.isUndef;
var strRepl = __modules__._strs.strRepl;
var strUpp = __modules__._strs.strUpp;
var strLow = __modules__._strs.strLow;
var strTrim = __modules__._strs.strTrim;
var strTrimR = __modules__._strs.strTrimR;
var strTrimL = __modules__._strs.strTrimL;
var strSub = __modules__._strs.strSub;
var strStarts = __modules__._strs.strStarts;
var strEnds = __modules__._strs.strEnds;
var strPadL = __modules__._strs.strPadL;
var strPadR = __modules__._strs.strPadR;
var isApprox = __modules__._util.isApprox;
var isIn = __modules__._util.isIn;
var isWithin = __modules__._util.isWithin;
var min = __modules__._math.min;
var max = __modules__._math.max;
var pow = __modules__._math.pow;
var sqrt = __modules__._math.sqrt;
var exp = __modules__._math.exp;
var log = __modules__._math.log;
var round = __modules__._math.round;
var sigFig = __modules__._math.sigFig;
var ceil = __modules__._math.ceil;
var floor = __modules__._math.floor;
var abs = __modules__._math.abs;
var sin = __modules__._math.sin;
var asin = __modules__._math.asin;
var sinh = __modules__._math.sinh;
var asinh = __modules__._math.asinh;
var cos = __modules__._math.cos;
var acos = __modules__._math.acos;
var cosh = __modules__._math.cosh;
var acosh = __modules__._math.acosh;
var tan = __modules__._math.tan;
var atan = __modules__._math.atan;
var tanh = __modules__._math.tanh;
var atanh = __modules__._math.atanh;
var atan2 = __modules__._math.atan2;
var boolean = __modules__._mathjs.boolean;
var number = __modules__._mathjs.number;
var string = __modules__._mathjs.string;
var mad = __modules__._mathjs.mad;
var mean = __modules__._mathjs.mean;
var median = __modules__._mathjs.median;
var mode = __modules__._mathjs.mode;
var prod = __modules__._mathjs.prod;
var std = __modules__._mathjs.std;
var vari = __modules__._mathjs.vari;
var sum = __modules__._mathjs.sum;
var hypot = __modules__._mathjs.hypot;
var norm = __modules__._mathjs.norm;
var square = __modules__._mathjs.square;
var cube = __modules__._mathjs.cube;
var remap = __modules__._arithmetic.remap;
var distance = __modules__._geometry.distance;
var distanceM = __modules__._geometry.distanceM;
var distanceMS = __modules__._geometry.distanceMS;
var intersect = __modules__._geometry.intersect;
var project = __modules__._geometry.project;
var range = __modules__._list.range;
var len = __modules__._common.len;
var listCount = __modules__._list.listCount;
var listCopy = __modules__._list.listCopy;
var listRep = __modules__._list.listRep;
var listLast = __modules__._list.listLast;
var listGet = __modules__._list.listGet;
var listFind = __modules__._list.listFind;
var listHas = __modules__._list.listHas;
var listJoin = __modules__._list.listJoin;
var listFlat = __modules__._list.listFlat;
var listRot = __modules__._list.listRot;
var listSlice = __modules__._list.listSlice;
var listRev = __modules__._list.listRev;
var listCull = __modules__._list.listCull;
var listSort = __modules__._list.listSort;
var listZip = __modules__._list.listZip;
var listEq = __modules__._list.listEq;
var dictGet = __modules__._dict.dictGet;
var dictKeys = __modules__._dict.dictKeys;
var dictVals = __modules__._dict.dictVals;
var dictHasKey = __modules__._dict.dictHasKey;
var dictHasVal = __modules__._dict.dictHasVal;
var dictFind = __modules__._dict.dictFind;
var dictCopy = __modules__._dict.dictCopy;
var dictEq = __modules__._dict.dictEq;
var setMake = __modules__._set.setMake;
var setUni = __modules__._set.setUni;
var setInt = __modules__._set.setInt;
var setDif = __modules__._set.setDif;
var vecAdd = __modules__._vec.vecAdd;
var vecSub = __modules__._vec.vecSub;
var vecDiv = __modules__._vec.vecDiv;
var vecMult = __modules__._vec.vecMult;
var vecSum = __modules__._vec.vecSum;
var vecLen = __modules__._vec.vecLen;
var vecSetLen = __modules__._vec.vecSetLen;
var vecNorm = __modules__._vec.vecNorm;
var vecRev = __modules__._vec.vecRev;
var vecFromTo = __modules__._vec.vecFromTo;
var vecAng = __modules__._vec.vecAng;
var vecAng2 = __modules__._vec.vecAng2;
var vecDot = __modules__._vec.vecDot;
var vecCross = __modules__._vec.vecCross;
var vecEqual = __modules__._vec.vecEqual;
var vecLtoG = __modules__._vec.vecLtoG;
var vecGtoL = __modules__._vec.vecGtoL;
var plnMake = __modules__._plane.plnMake;
var plnCopy = __modules__._plane.plnCopy;
var plnMove = __modules__._plane.plnMove;
var plnRot = __modules__._plane.plnRot;
var plnLMove = __modules__._plane.plnLMove;
var plnLRotX = __modules__._plane.plnLRotX;
var plnLRotY = __modules__._plane.plnLRotY;
var plnLRotZ = __modules__._plane.plnLRotZ;
var rayMake = __modules__._ray.rayMake;
var rayCopy = __modules__._ray.rayCopy;
var rayMove = __modules__._ray.rayMove;
var rayRot = __modules__._ray.rayRot;
var rayLMove = __modules__._ray.rayLMove;
var rayFromPln = __modules__._ray.rayFromPln;
var rayLtoG = __modules__._ray.rayLtoG;
var rayGtoL = __modules__._ray.rayGtoL;
var colFalse = __modules__._colors.colFalse;
var colScale = __modules__._colors.colScale;
var radToDeg = __modules__._conversion.radToDeg;
var degToRad = __modules__._conversion.degToRad;
var numToStr = __modules__._conversion.numToStr;
var rand = __modules__._rand.rand;
var randInt = __modules__._rand.randInt;
var randPick = __modules__._rand.randPick;

async function exec_eaEval(__params__){

async function exec_eaEval_node_e5l1zy9iyf8(__params__){
__modules__._model.__preprocess__( __params__.model);

__modules__.edit.Delete( __params__.model, null, 'delete_selected' );

let posis_ = __modules__.pattern.Line( __params__.model, [[30, 0, 0], [0, 1, 0], [1, 0, 0]], 150, 30 );

let street_pline_ = __modules__.make.Polyline( __params__.model, posis_, 'open' );

let street_pgon_ = __modules__.poly2d.OffsetMitre( __params__.model, street_pline_, 7, 5, 'square_end' );

__modules__.visualize.Color( __params__.model, street_pgon_, [0.7, 0.7, 1] );

let coll_ = __modules__.collection.Create( __params__.model, [street_pline_, street_pgon_[pythonList(0, street_pgon_.length)]], "street" );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaEval_node_2oq41y9zsng(__params__){
__modules__._model.__preprocess__( __params__.model);

__modules__.edit.Delete( __params__.model, null, 'delete_selected' );

let grid_ = __modules__.pattern.Grid( __params__.model, JSON.parse(JSON.stringify(XY)), 120, 3, 'flat' );

__modules__.list.Remove( grid_, 4, 'index' );

for (let  posi_ of grid_){

let xyz_ = __modules__.attrib.Get(__params__.model, posi_, 'xyz');

let rand_seed_ = xyz_[pythonList(0, xyz_.length)] + (xyz_[pythonList(1, xyz_.length)] * 0.12);

let rec_ = __modules__.pattern.Rectangle( __params__.model, __modules__.attrib.Get(__params__.model, posi_, 'xyz'), [30, 50] );

let pgon_ = __modules__.make.Polygon( __params__.model, rec_ );

let ex_ = __modules__.make.Extrude( __params__.model, pgon_, 3 * randInt(__debug__, 3, 5, rand_seed_) * 3, 1, 'quads' );
}

let coll_ = __modules__.collection.Create( __params__.model, __modules__.query.Get(__params__.model, 'pg', null), "context" );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaEval_node_kv0ecojlxj8(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_ = __modules__.collection.Get( __params__.model, "buildings_obstructions" );

__modules__.edit.Delete( __params__.model, coll_, 'keep_selected' );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaEval_node_rnmxsy9enqd(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_ = __modules__.collection.Create( __params__.model, __modules__.query.Get(__params__.model, 'pg', null), "obstructions" );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaEval_node_ohoxe6l6fea(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_ = __modules__.collection.Get( __params__.model, "buildings" );

__modules__.edit.Delete( __params__.model, coll_, 'keep_selected' );
__modules__._model.__postprocess__( __params__.model);
}



async function exec_eaEval_node_ffg9q4aemic_sigmoid_(__params__, values_, minmax_) {

let new_values_ = [];

for (let  value_ of values_){

let mapped_value_ = remap(__debug__, value_, minmax_, [-6, 6]);

let e_pow_ = exp(__debug__, mapped_value_);

__modules__.list.Add( new_values_, e_pow_ / (e_pow_ + 1), 'to_end' );
}

return new_values_;
}

async function exec_eaEval_node_ffg9q4aemic(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_buildings_ = __modules__.collection.Get( __params__.model, "buildings" );

let coll_obstructions_ = __modules__.collection.Get( __params__.model, "obstructions" );

let coll_buildings_obstructions_ = __modules__.collection.Get( __params__.model, "buildings_obstructions" );

let coll_street_ = __modules__.collection.Get( __params__.model, "street" );

let facade_pgons_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'pg', coll_buildings_), ['type', null], '==', "facade");

let street_xyzs_ = __modules__.attrib.Get(__params__.model,  __modules__.query.Get(__params__.model, 'ps',  __modules__.query.Get(__params__.model, 'pl', coll_street_)), 'xyz');

let street_pgon_ = __modules__.query.Get(__params__.model, 'pg', coll_street_);

let obstructions_ = __modules__.query.Get(__params__.model, 'pg', coll_obstructions_);

__modules__.list.Add( obstructions_, street_pgon_, 'to_end' );

let all_rays_ = [];

for (let  pgon_ of facade_pgons_){

let ray_ = __modules__.attrib.Get(__params__.model, pgon_, 'ray');

let origin_ = vecAdd(__debug__, ray_[pythonList(0, ray_.length)], vecSetLen(__debug__, ray_[pythonList(1, ray_.length)], 0.1));

let normal_ = vecNorm(__debug__, ray_[pythonList(1, ray_.length)]);

let dirs_ = vecFromTo(__debug__, origin_, street_xyzs_);

let rays_ = rayMake(__debug__, origin_, dirs_);

__modules__.list.Add( all_rays_, rays_, 'to_end' );
}

let result_ = __modules__.analyze.Raytrace( __params__.model, all_rays_, obstructions_, 200, 'all' );

for (let  i_ of range(__debug__, len(__debug__, result_))){

let all_intensity_ = [0];

for (let  j_ of range(__debug__, len(__debug__, result_[pythonList(i_, result_.length)]['hit_pgons']))){

let hit_pgon_ = result_[pythonList(i_, result_.length)]['hit_pgons'][pythonList(j_, result_[pythonList(i_, result_.length)]['hit_pgons'].length)];

if (hit_pgon_ == street_pgon_){

let dist_ = result_[pythonList(i_, result_.length)]['distances'][pythonList(j_, result_[pythonList(i_, result_.length)]['distances'].length)];

let intensity_ = 1 / (dist_ * dist_);

__modules__.list.Add( all_intensity_, intensity_, 'to_end' );
}
}

__modules__.attrib.Set(__params__.model, facade_pgons_[pythonList(i_, facade_pgons_.length)], 'noise',  sum(__debug__, all_intensity_) );
}

let del_coll_ = __modules__.collection.Get( __params__.model, ["obstructions", "buildings_obstructions", "street", "context"] );

__modules__.collection.Delete( __params__.model, del_coll_ );

__modules__.modify.Move( __params__.model, __modules__.query.Get(__params__.model, 'pg', null), [0, 100, 0] );

let noise_list_ = __modules__.attrib.Get(__params__.model, facade_pgons_, 'noise');

let noise_score_values_ = await exec_eaEval_node_ffg9q4aemic_sigmoid_(__params__, noise_list_, [0, 0.02]);
if (__params__.terminated) { return __params__.model;}

__modules__.attrib.Set(__params__.model, coll_buildings_, 'score',  mean(__debug__, noise_score_values_) );

__modules__.attrib.Set( __params__.model, facade_pgons_, "noise_score", noise_score_values_, 'many_values' );

__modules__.visualize.Gradient( __params__.model, facade_pgons_, "noise_score", null, 'false_color' );

__modules__.attrib.Set(__params__.model, coll_buildings_, 'analysis_type',  "noise" );
__modules__._model.__postprocess__( __params__.model);
}



async function exec_eaEval_node_032481p905ey_radarChart_(__params__, values_, origin_, radius_) {

let posis_ = [];

let coll_ = __modules__.collection.Create( __params__.model, [], "radar_plot" );

for (let  i_ of range(__debug__, len(__debug__, values_))){

let ray_ = rayRot(__debug__, [origin_, [radius_ * 1.1, 0, 0]], [origin_, [0, 0, 1]], i_ * 2 * JSON.parse(JSON.stringify(PI)) / len(__debug__, values_));

let axis_ = __modules__.visualize.Ray( __params__.model, ray_, radius_ / 10 );

let posi_ = __modules__.make.Position( __params__.model, vecAdd(__debug__, origin_, vecSetLen(__debug__, ray_[pythonList(1, ray_.length)], values_[pythonList(i_, values_.length)] * radius_)) );

__modules__.list.Add( posis_, posi_, 'to_end' );
}

let radar_pgon_ = __modules__.make.Polygon( __params__.model, posis_ );

__modules__.collection.Add( __params__.model, coll_, radar_pgon_ );

origin_[pythonList(2, origin_.length)] = origin_[pythonList(2, origin_.length)] + 0.1;

for (let  i_ of range(__debug__, 1, 11)){

let arc_ = __modules__.pattern.Arc( __params__.model, origin_, radius_ * (i_ / 10), len(__debug__, values_), null );

let pline_ = __modules__.make.Polyline( __params__.model, arc_, 'close' );

__modules__.collection.Add( __params__.model, coll_, pline_ );
}

return coll_;
}

async function exec_eaEval_node_032481p905ey(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_noise_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'co', null), ['analysis_type', null], '==', "noise");

coll_noise_ = coll_noise_[pythonList(0, coll_noise_.length)];

let coll_sun_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'co', null), ['analysis_type', null], '==', "sun");

coll_sun_ = coll_sun_[pythonList(0, coll_sun_.length)];

let coll_sky_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'co', null), ['analysis_type', null], '==', "sky");

coll_sky_ = coll_sky_[pythonList(0, coll_sky_.length)];

let coll_view_ = __modules__.query.Filter(__params__.model,  __modules__.query.Get(__params__.model, 'co', null), ['analysis_type', null], '==', "view");

coll_view_ = coll_view_[pythonList(0, coll_view_.length)];

let scores_ = [ __modules__.attrib.Get(__params__.model, coll_noise_, 'score'),  __modules__.attrib.Get(__params__.model, coll_sun_, 'score'),  __modules__.attrib.Get(__params__.model, coll_sky_, 'score'),  __modules__.attrib.Get(__params__.model, coll_view_, 'score')];

let coll_radar_ = await exec_eaEval_node_032481p905ey_radarChart_(__params__, scores_, [0, 0, 0], 30);
if (__params__.terminated) { return __params__.model;}

let coll_option_ = __modules__.collection.Create( __params__.model, [coll_noise_], "option" );

let weight_noise_ = 25;

let weight_sun_ = 25;

let weight_sky_ = 25;

let weight_view_ = 25;

let score_noise_ = __modules__.attrib.Get(__params__.model, coll_noise_, 'score')* weight_noise_;

let score_sun_ = __modules__.attrib.Get(__params__.model, coll_sun_, 'score')* weight_sun_;

let score_sky_ = __modules__.attrib.Get(__params__.model, coll_sky_, 'score')* weight_sky_;

let score_view_ = __modules__.attrib.Get(__params__.model, coll_view_, 'score')* weight_view_;

__modules__.attrib.Set(__params__.model, coll_option_, 'score',  score_noise_ + score_sun_ + score_sky_ + score_view_ );
__modules__._model.__postprocess__( __params__.model);
}


async function exec_eaEval_node_rldjktiv1e(__params__){
__modules__._model.__preprocess__( __params__.model);

let coll_option_ = __modules__.collection.Get( __params__.model, "option" );

__modules__.attrib.Add( __params__.model, 'co', 'dict', "result" );

let result_ = {"score":  __modules__.attrib.Get(__params__.model, coll_option_, 'score')};

let __return_value__ = __modules__._Output.Return(__params__.model, result_);
return __return_value__;
}

var merged;
let ssid_exec_eaEval_node_4laiocgnb3 = __params__.model.getActiveSnapshot();

let ssid_exec_eaEval_node_e5l1zy9iyf8 = __params__.model.nextSnapshot([ssid_exec_eaEval_node_4laiocgnb3]);

await exec_eaEval_node_e5l1zy9iyf8(__params__);

let ssid_exec_eaEval_node_2oq41y9zsng = __params__.model.nextSnapshot([ssid_exec_eaEval_node_4laiocgnb3]);

await exec_eaEval_node_2oq41y9zsng(__params__);

let ssid_exec_eaEval_node_kv0ecojlxj8 = __params__.model.nextSnapshot([ssid_exec_eaEval_node_4laiocgnb3]);

await exec_eaEval_node_kv0ecojlxj8(__params__);

let ssid_exec_eaEval_node_rnmxsy9enqd = __params__.model.nextSnapshot([ssid_exec_eaEval_node_2oq41y9zsng, ssid_exec_eaEval_node_kv0ecojlxj8]);

await exec_eaEval_node_rnmxsy9enqd(__params__);

let ssid_exec_eaEval_node_ohoxe6l6fea = __params__.model.nextSnapshot([ssid_exec_eaEval_node_4laiocgnb3]);

await exec_eaEval_node_ohoxe6l6fea(__params__);

let ssid_exec_eaEval_node_ffg9q4aemic = __params__.model.nextSnapshot([ssid_exec_eaEval_node_e5l1zy9iyf8, ssid_exec_eaEval_node_rnmxsy9enqd, ssid_exec_eaEval_node_ohoxe6l6fea]);

await exec_eaEval_node_ffg9q4aemic(__params__);

let ssid_exec_eaEval_node_032481p905ey = ssid_exec_eaEval_node_ffg9q4aemic;

await exec_eaEval_node_032481p905ey(__params__);

let ssid_exec_eaEval_node_rldjktiv1e = __params__.model.nextSnapshot([ssid_exec_eaEval_node_032481p905ey]);

return await exec_eaEval_node_rldjktiv1e(__params__);
}


function pythonList(x, l){
    if (x < 0) {
        return x + l;
    }
    return x;
}

function mergeInputs(models){
    let result = null;
    if (models.length === 0) {
        result = __modules__._model.__new__();
    } else if (models.length === 1) {
        result = models[0].clone();
    } else {
        result = models[0].clone();
        for (let i = 1; i < models.length; i++) {
            __modules__._model.__merge__(result, models[i]);
        }
    }
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}
function duplicateModel(model){
    const result = model.clone();
    try {
        result.debug = __debug__;
    } catch (ex) {}
    return result;
}

function printFunc(_console, name, value){
    let val;
    let padding_style = 'padding: 2px 0px 2px 10px;';
    if (!value) {
        val = value;
    } else if (value === '__null__') {
        _console.push('<p style="' + padding_style + '"><b><i>_ ' + name + '</i></b></p>');
        return value;
    } else if (typeof value === 'number' || value === undefined) {
        val = value;
    } else if (typeof value === 'string') {
        val = '"' + value.replace(/\n/g, '<br>') + '"';
    } else if (value.constructor === [].constructor) {
        let __list_check__ = false;
        let __value_strings__ = [];
        for (const __item__ of value) {
            if (!__item__) {
                __value_strings__.push('' + __item__);
                continue;
            }
            if (__item__.constructor === [].constructor || __item__.constructor === {}.constructor) {
                __list_check__ = true;
            }
            __value_strings__.push(JSON.stringify(__item__).replace(/,/g, ', '));
        }
        if (__list_check__) {
            padding_style = 'padding: 2px 0px 0px 10px;';
            val = '[<p style="padding: 0px 0px 2px 40px;">' +
                  __value_strings__.join(',</p><p style="padding: 0px 0px 2px 40px;">') +
                  '</p><p style="padding: 0px 0px 2px 30px;">]</p>';
        } else {
            val = '[' + __value_strings__.join(', ') + ']';
        }
    } else if (value.constructor === {}.constructor) {
        let __list_check__ = false;
        let __value_strings__ = [];
        for (const __item__ in value) {
            const __value__ = value[__item__];
            if (!__value__) {
                __value_strings__.push('\<b>"' + __item__ + '\"</b>' + ': ' + __value__);
                continue;
            }
            if (__value__.constructor === [].constructor || __value__.constructor === {}.constructor) {
                __list_check__ = true;
            }
            __value_strings__.push('\<b>"' + __item__ + '\"</b>' + ': ' + JSON.stringify(__value__).replace(/,/g, ', '));
        }
        if (__list_check__) {
            padding_style = 'padding: 2px 0px 0px 10px;';
            val = '{<p style="padding: 0px 0px 2px 40px;">' +
                  __value_strings__.join(',</p><p style="padding: 0px 0px 2px 40px;">') +
                  '</p><p style="padding: 0px 0px 2px 30px;">}</p>';
        } else {
            val = '{' + __value_strings__.join(', ') + '}';
        }
    } else {
        val = value;
    }
    _console.push('<p style="' + padding_style + '"><b><i>_ ' + name+'</i></b>  = ' + val + '</p>');
    return val;
}


const __params__ = {};
__params__["model"] = __modules__._model.__new__();
if (__model__) {
__modules__.io._importGI(__params__["model"], __model__);
}
__params__["model"].debug = __debug__;
__params__["console"] = [];
__params__["modules"] = __modules__;
__params__["curr_ss"] = {};
const result = await exec_eaEval(__params__);
if (result === __params__.model) { return { "model": __params__.model, "result": null };}
return {"model": __params__.model, "result": result};
/** * **/

}

module.exports = eaEval;
