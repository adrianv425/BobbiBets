<template class="row">
    <div class="title">
    <router-link to="/">
    <div class="inline-block title" v-html="require('!!html-loader!../assets/logo.svg')">
    </div>
    </router-link>
    <img :class="$style.betSlip" v-bind:src="require('../assets/betSlip.png')"/>
    </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
export default {
    name: "svgTitle",
    data(){
        return{
            search:''
        }
    },
    mounted() {
        this.$el.removeAttribute('class');
    }
}
</script>

<style module>
.betSlip{
    position: fixed;
    top: 0.5em;
    right: 17%;
    max-height: 2.5em;
}
</style>
<style>
.title{
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(47, 79, 79, 1);
    width: 100%;
    max-height: 4.5em;
    padding-left: 4%;
    padding-top:0.1em;
}
text.cls-1{
    font-size:216px;
    fill:#fff;
    stroke:#000;
    stroke-miterlimit:10;
    stroke-width:7px;
    font-family: Bauhaus93, Bauhaus 93;
}
svg {
    width: 90%;
    max-width: 30em;
}
</style>