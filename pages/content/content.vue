<template>
    <view class="u-content">
        <u-parse :content="content"></u-parse>
    </view>
</template>

<script>
    export default {
        onLoad(option) {
            console.log(option);
            this.$http(`/resource/wx/${option.id}/${option.type}`).then(data => {
                this.data = data
                for (let i = 0; i < data.length; i++) {
                    if (option.type === 'image') {
                        let template = `
                            <h4>${i + 1}.${data[i].originalName}</h4>
                            <p style="text-indent: 0px; text-align: center; line-height: 2em;">
                                <img src="${data[i].accessUrl}" alt="${data[i].originalName}" data-href="" style="">
                            </p>
                        `
                        this.content += template

                    } else if (option.type === 'video') {
                        let template = `
                            <h4>${i + 1}.${data[i].originalName}</h4>
                            <div style="width:100vw" data-w-e-type="video" data-w-e-is-void>
                                <video style="width:100vw" controls="true">
                                    <source src="${data[i].accessUrl}" type="video/*"/></video>
                            </div>
                        `
                        this.content += template
                    } else if (option.type === 'audio') {
                        let template = `
                            <h4>${i + 1}.${data[i].originalName}</h4>
                            <div style="width:100vw" data-w-e-type="audio" data-w-e-is-void>
                                <video style="width:100vw" controls="true">
                                    <source src="${data[i].accessUrl}" type="audio/*"/></video>
                            </div>
                        `
                        this.content += template
                    } else  {
                        let template = `
                            <p style="text-indent:2em;">${data[i].addition}</p>
                        `
                        this.content += template
                    }
                }
            })
        },
        data() {
            return {
                data: [],
                content: ``
            }
        },
    }
</script>
