<script setup>
    import ExpandCard from './components/ProductLoad/ExpandCard.vue';
</script>

<template>
    <div>
        <div class="pl__heading">
            <h2>Product Load</h2>
        </div>
        
        <div class="products__container bg_red">
            <h2>Product List</h2>
            <div class="w-25">
                <v-text-field clearable label="Search" variant="underlined"></v-text-field>
            </div>
            <ExpandCard/>
            <ExpandCard/>
            <ExpandCard/>
            <ExpandCard/>
        </div>
    </div>
</template>

<style scoped>
.pl__heading{
    padding: 10px 20px;
    background-color: rgb(28, 42, 75);
    color: white;
}
/* .bg_red{
    background-color: red;
} */
.products__container{
    margin: 20px 60px 0px 60px;
}
</style>