<template>
    <div id="navigation-overlay">
        <div id="search">
            <v-form @submit.prevent="searchPlace(query)" v-if="!showDirections">
                <v-text-field clearable id="search-bar" outlined v-model="query.properties.display_name" label="Search" append-icon="mdi-magnify"
                    @click:append="searchPlace(query)" append-outer-icon="mdi-directions"
                    @click:append-outer="showDirections=true"></v-text-field>
            </v-form>
            <v-icon id="close-icon" v-if="showDirections" @click="showDirections=false">mdi-close</v-icon>
            <v-form v-if="showDirections" @submit.prevent="postDirections(origin, destination)">
                <v-form @submit.prevent="searchPlace(origin)">
                    <v-text-field clearable outlined v-if="(typeof origin.properties.name === 'undefined')" v-model="origin.properties.display_name"
                        label="From" append-icon="mdi-magnify" @click:append="searchPlace(origin)" ></v-text-field>
                    <!-- If gotDetails == true: show properties.name-->
                    <v-text-field clearable outlined v-if="origin.properties.name" v-model="origin.properties.name" label="From"
                        append-icon="mdi-magnify" @click:append="searchPlace(origin)" ></v-text-field>
                </v-form>
                <v-form @submit.prevent="searchPlace(destination)">
                    <v-text-field clearable outlined v-if="(typeof destination.properties.name === 'undefined')"
                        v-model="destination.properties.display_name" label="To" append-icon="mdi-magnify"
                        @click:append="searchPlace(destination)" append-outer-icon=""></v-text-field>
                    <!-- If gotDetails == true: show properties.name-->
                    <v-text-field clearable outlined v-if="(typeof destination.properties.name !== 'undefined')" v-model="destination.properties.name"
                        label="To" append-icon="mdi-magnify" @click:append="searchPlace(destination)"></v-text-field>
                </v-form>
                <v-btn type="submit">Navigate</v-btn>
            </v-form>
            <v-text-field v-if="loadingResults" color="primary" loading disabled></v-text-field>
            <div id="results-div">
            <v-list v-if="queryResult.results[0]">
                <v-list-item two-line v-for="(result, i) in queryResult.results" :key="i"
                    @click="selectResult(result, queryResult.queryOrigin)">
                    <v-list-item-icon>
                        <v-icon>{{  icons[result.properties.type]  }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <!-- if search result has a name use name-->
                        <v-list-item-title v-if="(result.properties.name != null)" v-html="'1'+result.properties.name">
                        </v-list-item-title>

                        <!-- if search result has no name and an address use street & housenumber as name-->
                        <v-list-item-title
                            v-if="(typeof result.properties.address !== 'undefined') && (result.properties.name == null)"
                            v-html="'2'+result.properties.address.road + ' ' + result.properties.address.house_number">
                        </v-list-item-title>

                        <!-- if search result has no address and no name use display_name -->
                        <v-list-item-title
                            v-if="(typeof result.properties.address === 'undefined') && (result.properties.name == null)"
                            v-html="'3'+result.properties.display_name"></v-list-item-title>

                        <!-- if search result has a name and a road, but no housenumber display address in subtitle -->
                        <v-list-item-subtitle
                            v-if="(result.properties.name != null) && (typeof result.properties.address.road !== 'undefined') && (typeof result.properties.address.house_number === 'undefined')"
                            v-html="'4'+result.properties.address.road">
                        </v-list-item-subtitle>

                        <!-- if search result has a name, but no display address in subtitle -->
                        <v-list-item-subtitle
                            v-if="(result.properties.name != null) && (typeof result.properties.address.road === 'undefined') && (typeof result.properties.address.house_number === 'undefined')"
                            v-html="'4.1 '+ result.properties.address.postcode + ' ' + result.properties.address.state">
                        </v-list-item-subtitle>

                        <!-- if search result has a name, display address in subtitle -->
                        <v-list-item-subtitle
                            v-if="(result.properties.name != null) && (typeof result.properties.address.house_number !== 'undefined')"
                            v-html="'5'+result.properties.address.road + ' ' + result.properties.address.house_number">
                            {{    }}
                        </v-list-item-subtitle>

                        <!-- if search result has no name and a town, display postcode and town in subtitle -->
                        <v-list-item-subtitle
                            v-if="(result.properties.name == null) && (typeof result.properties.address !== 'undefined') && (typeof result.properties.address.town !== 'undefined')"
                            v-html="'6'+result.properties.address.postcode + ' ' + result.properties.address.town">
                        </v-list-item-subtitle>

                        <!-- if search result has no name and no town display, postcode and state in subtitle -->
                        <v-list-item-subtitle
                            v-if="(result.properties.name == null) && (typeof result.properties.address !== 'undefined') && (typeof result.properties.address.town === 'undefined')"
                            v-html="'7'+result.properties.address.postcode + ' ' + result.properties.address.state">
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action></v-list-item-action>
                </v-list-item>
            </v-list>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import {
        mdiMagnify,
        mdiClose,
        mdiDirections,
        mdiSchool,
        mdiNature,
        mdiHome,
        mdiFood,
        mdiSkullCrossbones,
    } from '@mdi/js';
    export default {
        name: "Search",
        props: {
            icons: Object,
            viewbox: Array,
        },
        watch: {
            viewbox: {
                handler: function (newValue, oldValue) {
                    if(Object.keys(this.lastQuery).length !== 0 && this.lastQuery.constructor === Object){
                        this.searchPlace(this.lastQuery)
                        //this.$forceUpdate()
                    }

                    
                },
                deep: true,
                immediate: true,
            }
        },
        data: () => ({
            lastQuery: {},
            loadingResults: false,
            tmpDetails: {},
            query: {
                type: "query",
                properties: {
                    display_name: "",
                }

            },
            origin: {
                type: 'origin',
                properties: {
                    display_name: "Gärtnerstraße 4 Berlin",
                },
                geometry: {
                    coordinates: []
                }
            },
            destination: {
                type: 'destination',
                properties: {
                    display_name: "Code University Berlin",
                }
            },
            queryResult: {
                type: "",
                results: [],
                /*
                results: [{
                        properties: {
                            display_name: "Gärtnerstraße 4 Berlin",
                        },
                        geometry: {
                            coordinates: []
                        }
                    },
                    {
                        properties: {
                            display_name: "Gärtnerstraße 5 Berlin",
                        },
                        geometry: {
                            coordinates: []
                        }
                    },
                ]
                */
            },
            showDirections: false,
            // set active cities so we can limit search results
            cities: [{
                berlin: {}
            }]

            //results: []
        }),
        methods: {
            resultLoader(queryResult) {
                this.queryResult = queryResult
            },
            searchAddress(location) {
                document.getElementById("navigation-overlay").style.height = '100%'
                var baseurl = 'http://localhost:7070/search?format=geojson&q='
                
                //var query = 'Gärtnerstraße 4 Berlin'
                console.log(location)
                axios.get(baseurl + location.properties.display_name).then(response => {
                    console.log(response.data.features)
                    if (location.type == 'origin') {
                        this.origins = response.data.features
                        console.log(this.origins)

                    } else if (location.type == 'destination') {
                        this.destinations = response.data.features
                        console.log(this.destinations)

                    } else {
                        this.queryResult.results = response.data.features
                        console.log(this.queryResult.results)
                    }
                })
            },
            async searchPlace(location) {
                //console.log(location)
                this.lastQuery = location
                document.getElementById("navigation-overlay").style.height = '100%'
                this.queryResult.queryOrigin = location.type
                this.loadingResults = true
                //var baseurl = 'http://localhost:7070/search?format=geojson&q='
                //var query = '&q=' + location.properties.display_name
                //var limit = '&limit=50'
                var viewboxQuery= '&viewbox=' + this.viewbox // + '&bounded=1'
                //var email = '&email=fabian.volkers%40code.berlin'
                //console.log(navigator.userAgent)
                var osmbridge_url = 'http://localhost:8000/osmbridge/search/?q=' + location.properties.display_name + viewboxQuery
                
                //console.log(baseurl + location.properties.display_name + limit + viewboxQuery + email)
                var config = {
                    headers: {
                        'Content-Type': 'application/json',
                        //'User-agent': navigator.userAgent
                    }
                }
                //await axios.get(baseurl + location.properties.display_name + limit + viewboxQuery + email, config).then(response => {
                await axios.get(osmbridge_url, config).then(response => {
                        this.queryResult.results = response.data.features
                    //console.log(response)
                    //this.getDetails()
                }).catch(e => {
                    this.errors.push(e)
                })
                /*
                                var i = 0
                                for (i in this.queryResult.results) {

                                    this.getDetails(this.queryResult.results[i], this.queryResult.queryOrigin)
                                    console.log(this.tmpDetails)
                                    this.queryResult.results[i].properties.name = this.tmpDetails.properties.name
                                    this.queryResult.results[i].properties.address = this.tmpDetails.properties.address
                                    console.log(this.queryResult.results[i])
                                    //this.queryResult.results[i] = this.getDetails(this.queryResult.results[i], this.queryResult.queryOrigin)
                                }
                                
                                //console.log(this.queryResult.results)
                                //return results
                */
                this.loadingResults = false
                //console.log(this.queryResult)
                this.$emit('got-results', this.queryResult)
            },

            async getDetails() {
                //console.log(type)
                var baseurl = 'http://localhost:7070/reverse?format=geojson&osm_type='
                var urlend = '&osm_id='
                //this.results = location
                var i = 0
                for (i in this.queryResult.results) {
                    await axios.get(baseurl + this.queryResult.results[i].properties.osm_type[0].toUpperCase() +
                        urlend + this.queryResult.results[i].properties.osm_id).then(response => {
                        //console.log(response.data)
                        this.queryResult.results[i] = response.data.features[0]
                        //var city = ""
                        //if 
                        //this.queryResult.results[i].properties.address.city = 
                        //this.tmpDetails = response.data.features[0]
                    }).catch(e => {
                        this.errors.push(e)

                    })
                }
                //console.log(this.queryResult)
                this.$forceUpdate()
                /*
                await axios.get(baseurl + location.properties.osm_type[0].toUpperCase() + urlend + location
                    .properties.osm_id).then(response => {
                    this.tmpDetails = response.data.features[0]
                    console.log(this.tmpDetails)
                    //console.log(type)

                    /*
                    if (type == 'origin') {
                        this.origin = response.data.features[0]
                        console.log(this.origin)

                    } else if (type == 'destination') {
                        this.destination = response.data.features[0]
                        console.log(this.destination)
                    }
                    
                }).catch(e => {
                    this.errors.push(e)

                })
*/

            },
            selectResult(location, type) {
                //console.log(location)
                location = this.getDetails(location, type)
                if (type == 'origin') {
                    this.origin = location
                    console.log(this.origin)

                } else if (type == 'destination') {
                    this.destination = location
                    console.log(this.destination)
                }
            },

            async postDirections(origin, destination) {
                //console.log(origin, destination)
                var url = 'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson'
                //var authKey = '5b3ce3597851110001cf6248013a1de706624b69a83c5b9a2dd28edf'
                let config = {
                    headers: {
                        Authorization: '5b3ce3597851110001cf6248013a1de706624b69a83c5b9a2dd28edf',
                    },
                }
                this.routes = {
                    fastest: {
                        request: {
                            coordinates: [
                                origin.geometry.coordinates,
                                destination.geometry.coordinates,
                            ],

                        },
                        response: {}
                    },
                    shortest: {
                        request: {
                            coordinates: [
                                origin.geometry.coordinates,
                                destination.geometry.coordinates,
                            ],
                            'preference': 'shortest'
                        },
                        response: {}
                    },
                    recommended: {
                        request: {
                            coordinates: [
                                origin.geometry.coordinates,
                                destination.geometry.coordinates,
                            ],
                            'preference': 'recommended',
                            /*
                            'options': {
                                'avoid_features': 'unpavedroads',
                                'profile_params': {
                                    'weightings' : {
                                        'green': '1',
                                        'surface_type': 'cobblestone:flattened',
                                        'smoothness_type': 'good',
                                    },
                                    'restrictions' : {

                                    },
                                    
                                    
                                    
                                },
                                "avoid_polygons": {
                                    "type": "Polygon",
                                    "coordinates": [
                                        [
                                            [100.0, 0.0],
                                            [101.0, 0.0],
                                            [101.0, 1.0],
                                            [100.0, 1.0],
                                            [100.0, 0.0]
                                        ]
                                    ]
                                }

                            }*/
                        },
                        response: {}
                    }
                }

                // 3 seperate API calls
                //fastest route
                await axios.post(url, this.routes['fastest'].request, config).then(response => {
                    this.routes['fastest'].response = response.data

                }).catch(e => {
                    this.errors.push(e)
                })

                //shortest route
                await axios.post(url, this.routes['shortest'].request, config).then(response => {
                    this.routes['shortest'].response = response.data

                }).catch(e => {
                    this.errors.push(e)
                })

                //recommended route
                await axios.post(url, this.routes['recommended'].request, config).then(response => {
                    this.routes['recommended'].response = response.data
                    this.$emit('got-route', this.routes)

                }).catch(e => {
                    this.errors.push(e)
                })

                /*
                axios.post(url, data, config).then(response => {
                    let route = response.data
                    console.log(response.data)
                    this.$emit('got-route', route)
                }).catch(e => {
                    this.errors.push(e)
                })
                */
            }

        }

    }
</script>

<style>
    #search {
        position: absolute;
        top: 1em;
        left: .5em;
        z-index: 0;
        height: 100%;
        width: 95%;
        
    }

    #search-bar {
        background-color: white;
        /*position: fixed;*/
        width: 25%;
    }

    #navigation-overlay {
        background-color: white;
        width: 30%;
        /*height: 100%;*/
        position: absolute;
        z-index: 1;
        max-height: 95vh;
    }

    #results-div {
        position: fixed;
        z-index: 2;
        overflow-x:scroll;
        /*max-height: */
    }

    #results {
        position: relative;
        overflow-x: scroll;

    }

    #close-icon {
        float:right;
    }
</style>