<template>
    <div>
        <ul>
            <li>
                <v-text-field v-model="origin.properties.display_name" label="From"></v-text-field>
                <v-btn color="primary" v-on:click="searchAddress(origin)">Search</v-btn>
                <v-select :items="origins" item-text="properties.display_name" return-object v-model="originSelect">
                </v-select>
            </li>
            <li>
                <v-text-field v-model="destination.properties.display_name" label="To"></v-text-field>
                <v-btn color="primary" v-on:click="searchAddress(destination)">Search</v-btn>
                <v-select :items="destinations" item-text="properties.display_name" return-object
                    v-model="destinationSelect">
                </v-select>
            </li>
            <v-btn id="nav-btn" color="primary" v-on:click="postDirections(originSelect, destinationSelect)">Navigate
            </v-btn>
        </ul>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'Navigation',
        props: {},
        data: () => ({
            origin: {
                type: 'origin',
                properties: {
                    display_name: "Gärtnerstraße 4 Berlin",
                },
                geometry: {
                    coordinates: []
                }
            },
            origins: [],
            originSelect: {},
            destination: {
                type: 'destination',
                properties: {
                    display_name: "Code University Berlin",
                }
            },
            destinations: [],
            destinationSelect: {},
            routes: {},
        }),
        methods: {
            searchAddress(location) {
                var baseurl = 'https://nominatim.openstreetmap.org/search?format=geojson&q='
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

                    }
                })
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


        },
        mounted() {
            //this.postDirections()
            //this.searchAddress()
        }
    }
</script>

<style>
    ul {
        list-style: none;
    }

    li {
        box-sizing: border-box;
        float: left;
        width: 25%;
        padding: 15px;
        margin-top: 25px;
    }

    #nav-btn {
        float: left;
        width: 15%;
        margin: 15px;
        margin-top: 40px;
    }
</style>