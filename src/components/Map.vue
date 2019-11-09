<template>
    <div id="map"></div>
</template>

<script>
    import 'ol/ol.css';
    import Map from 'ol/Map';
    import View from 'ol/View';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM.js';
    import VectorSource from 'ol/source/Vector';
    import VectorLayer from 'ol/layer/Vector';
    import Feature from 'ol/Feature';
    import Polygon from 'ol/geom/Polygon';
    import Point from 'ol/geom/Point';
    import {
        Fill,
        Stroke,
        Circle,
        Style
    } from 'ol/style';
    import Icon from 'ol/style/Icon';
    import {
        fromLonLat
    } from 'ol/proj.js';
    import GeoJSON from 'ol/format/GeoJSON';
    import Collection from 'ol/Collection';
    import LineString from 'ol/geom/LineString';

    export default {
        name: 'MapComponent',
        props: {
            //geoJSONroute: Object,
            routes: Object,
        },
        watch: {
            routes(newValue, oldValue) {
                //console.log(newValue)
                this.loadRoute()
            }
        },
        data: () => ({
            map: {},

        }),
        methods: {
            loadMap(lat, lon) {
                var zoom = 14

                this.map = new Map({
                    target: 'map',
                    layers: [
                        new TileLayer({
                            preload: 4,
                            source: new OSM()
                        }),

                    ],
                    view: new View({
                        center: fromLonLat([lon, lat]),
                        zoom: zoom,
                    }),
                })
            },

            loadRoute() {
                var fill = new Fill({
                    color: 'rgba(255,255,255,0.4)'
                });
                var stroke = new Stroke({
                    color: '#1b5e20',
                    width: 4.25
                });
                var styles = [
                    new Style({
                        image: new Circle({
                            fill: fill,
                            stroke: stroke,
                            radius: 5
                        }),
                        fill: fill,
                        stroke: stroke
                    })
                ];
                var i = this.map.getLayers().array_.length
                while (i > 0){
                    this.map.removeLayer(this.map.getLayers().array_[i])
                    i -= 1
                }
                //.log(this.routes)
                console.log(JSON.stringify(this.routes))
                var j = 0
                while(j < 3){
                    //console.log(this.routes['fastest'])
                    var activeRoute = {}
                    if(j == 0){
                        activeRoute = this.routes['fastest']
                    }
                    else if(j == 1){
                        activeRoute = this.routes['shortest']
                    }
                    else if(j == 2){
                        activeRoute = this.routes['recommended']
                    }


                    //console.log(JSON.stringify(activeRoute))
                    if (typeof activeRoute.response.features != 'undefined') {
                        //console.log(activeRoute)
                        var routeLayer = new VectorLayer({
                            zIndex: Infinity,
                            source: new VectorSource({
                                //projection: 'EPSG:3857',
                                features: (new GeoJSON({
                                    featureProjection: 'EPSG:3857'
                                })).readFeatures(activeRoute.response)

                            }),
                            style: styles,
                        })
                        this.map.addLayer(routeLayer)
                    }
                    j += 1
                }
                
                /*
                for (var route in this.routes) {
                    console.log(route)
                    if (typeof this.routes[i].response.features != 'undefined') {
                        console.log(this.routes[i])
                        var routeLayer = new VectorLayer({
                            zIndex: Infinity,
                            source: new VectorSource({
                                //projection: 'EPSG:3857',
                                features: (new GeoJSON({
                                    featureProjection: 'EPSG:3857'
                                })).readFeatures(this.routes[i].response)

                            }),
                            style: styles,
                        })
                        this.map.addLayer(routeLayer)
                    }

                }
                */


            }

        },
        mounted() {
            this.loadMap(52.49388, 13.44672)
            //this.loadRoute()
            //console.log(this.geoJSONroute)
        },
        updated() {
            //console.log(this.geoJSONroute)
        },


    }
</script>

<style>
    #map {
        width: 100%;
        height: 100%;
        /*background-color: aquamarine;*/
    }
</style>