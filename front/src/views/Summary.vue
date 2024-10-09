<template>
    <v-container>
        <v-text-field v-model="url" placeholder="링크를 입력해주세요"></v-text-field>
        <div class="text-center">
            <v-btn color="primary" @click="summary">요약하기</v-btn>
        </div>

        <h1>{{ title }}</h1>
        <p>{{ summaryText }}</p>
    </v-container>
</template>
<script>
export default {
    data() {
        return {
            file: null,
            url: '',
            title: '',
            summaryText: ''
        }
    },
    methods: {
        changeFile() {
            console.log(this.file)
        },
        async summary() {
            var response = await this.$axios.post("/api/summary", {
                url: this.url
            })
            console.log(response.data)
            this.title = response.data.title
            this.summaryText = response.data.summary

            new Audio("/api/sound?text=" + encodeURI(this.summaryText)).play()
        }

    }
}
</script>
<style></style>