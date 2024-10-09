<template>
    <v-container>
        <v-file-input v-model="file" @change="changeFile"></v-file-input>

        <div class="calories" v-if="calories">
            {{ calories }}kcal
        </div>
        <div class="food-name">
            {{ food_name }}
        </div>
    </v-container>
</template>
<script>
export default {
    data() {
        return {
            file: null,
            calories: null,
            food_name: null
        }
    },
    methods: {
        async changeFile() {
            console.log(this.file)
            var response = await this.$axios.post("/api/vision", {
                file: this.file
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log(response.data)
            this.calories = response.data.calories
            this.food_name = response.data.food_name
        }
    }
}
</script>
<style></style>