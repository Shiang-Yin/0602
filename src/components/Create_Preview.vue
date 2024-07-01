<script>
import { RouterLink } from 'vue-router';
import Swal from 'sweetalert2';

export default{
    name: 'Create_Preview',
    data(){
        return{
             // 此處需根據需要設置要顯示的問卷內容
            quizData: null,
            create_isPublished:false,
        }
    },
    created() {
        if (this.$route.query.data) {
            try {
                this.quizData = JSON.parse(this.$route.query.data);
            } catch (error) {
                console.error('解析 JSON 數據時發生錯誤:', error);
            }
        } else {
            console.error('$route.query.data 中找不到數據');
        }
    },
    mounted() {
        const savedState = localStorage.getItem('formData');
        if (savedState) {
            try {
                const formData = JSON.parse(savedState);
                this.create_title = formData.create_title;
                this.create_description = formData.create_description;
                this.create_startDate = formData.create_startDate;
                this.create_endDate = formData.create_endDate;
                this.create_question = formData.create_question;
            } catch (error) {
                console.error('解析 JSON 資料時發生錯誤:', error);
            }
        }
    },

    methods: {
        submitQuiz() {
            Swal.fire({
                title: '是否要發佈問卷？',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '確認發布',
                cancelButtonText: '暫不發布'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.create_isPublished = true;
                } else {
                    this.create_isPublished = false;
                }

                const typeMap = {
                    'single': '單選',
                    'multiple': '多選',
                    'text': '文字'
                };

                let createObj = {
                    id: this.quizData.id,
                    name: this.quizData.create_title,
                    description: this.quizData.create_description,
                    start_date: this.quizData.create_startDate,
                    end_date: this.quizData.create_endDate,
                    question_list: this.quizData.create_question.map(q => ({
                        id: q.id,
                        title: q.title,
                        options: q.options,
                        is_necessary: q.is_necessary,
                        type: typeMap[q.type] || q.type
                    })),
                    is_published: this.create_isPublished
                };

                fetch("http://localhost:8080/quiz/updateOrCreate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(createObj)
                })
                .then(res => res.json())
                .then(data => {
                    Swal.fire({
                        title: '問卷提交成功',
                        icon: 'success'
                    }).then(() => {
                        localStorage.removeItem('formData');
                        this.$router.push({ name: 'Quiz' });
                    });
                })
                .catch(error => {
                    console.error('提交問卷時發生錯誤:', error);
                    Swal.fire({
                        title: '提交問卷失敗，請重試',
                        icon: 'error'
                    });
                });
            });
        },
        getQuestionTypeInChinese(type) {
            const typeMap = {
                'single': '單選',
                'multiple': '多選',
                'text': '文字',
                '單選': '單選',
                '多選': '多選',
                '文字': '文字'
            };
            return typeMap[type] || type;
        }
    }
}
</script>

<template>
<div class="area">   
    <div class="quizArea">
        <h2>問卷預覽</h2>
        <div v-if="quizData" class="aaa">
            <p class="ppp">標題 : <span class="xx">{{ quizData.create_title }}</span> </p>
            <p class="ppp">描述 : <span class="xx">{{ quizData.create_description }}</span></p>
            <p class="ppp1">
                <span>開始時間</span>
                <span class="xx1">{{ quizData.create_startDate }}</span>
                <span class="spacer"></span>
                <span>結束時間</span>
                <span class="xx1">{{ quizData.create_endDate }}</span>
            </p>

            <div v-for="question in quizData.create_question" :key="question.id" class="question-item">
                
                <div class="ttt">{{question.id}}、 {{ question.title }}({{ getQuestionTypeInChinese(question.type)  }})
                    <span v-if="question.is_necessary" class="required">*</span>
                </div>
                <!-- <div class="ttt"><p>是否必填:</p> {{ question.is_necessary==true  ?  "必填" : '非必填' }}</div> -->
                <!-- <p><strong>類型:</strong> {{ question.type  === 'single' ? '單選' : (question.type === 'multiple' ? '多選' : '文字') }}</p> -->
                <!-- <div class="ttt"><p>類型:</p> {{ getQuestionTypeInChinese(question.type)  }}</div> -->
                <template v-if="question.type === 'text'">
                    <p><strong>文字:</strong> <textarea class="textt" type="text"></textarea></p>
                </template>
                <template v-else-if="question.type === 'single'">
                    <div class="options">
                        <p v-for="option in question.options.split(';')" :key="option" class="option-item">
                            <input type="radio" :id="option"  name="single-option" :value="option">
                            <label :for="option">{{ option }}</label>
                        </p>
                    </div>
                    
                </template>
                <template v-else-if="question.type === 'multiple'">
                    <div class="options">
                        <p v-for="option in question.options.split(';')" :key="option" class="option-item">
                            <input type="checkbox" :id="option"  :value="option">
                            <label :for="option">{{ option }}</label>
                        </p>
                    </div>
                </template>
                
            </div>
        </div>
        <p v-else>正在加載問卷預覽...</p>
    </div>

    <div class="buttonArea">
        <!-- 點擊上一頁可以在編輯 -->
        <router-link :to="{ name: 'Create', query: { data: JSON.stringify(quizData) } }">
            <button class="t1" type="button">上一步</button>
        </router-link>
        <!-- 點擊提交新增置資料庫 -->
        <button class="t1" type="button" @click="submitQuiz">提交問卷</button>
    </div>
</div> 
</template>


<style scoped lang="scss">

.area {
    width: 100%;
    // margin-top: 2%;
    // border: 1px solid #ccc;
    border-radius: 8px;
    // background-color: #fff;
    // background-color: #a8f3d438;
    background-color: #a8f3d438;
    font-size: 20px;
}
.quizArea {
    width: 60%;
    margin: 0 auto;
    // margin-top: 2%;
    // border: 1px solid #ccc;
    border-radius: 8px;
    // background-color: #fff;
    // background-color: #d9f3a891;
    font-size: 20px;
}

h2 {
    font-size: 30px;
    text-align: center;
    color: #333;
}

.aaa{
    width: 80%;
    margin: 0 auto;
    border: 1px dashed rgba(0, 0, 0, 0.364);
    border-radius: 20px;
    background-color: #e4b8ff5f;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.299); /* 添加陰影 */
    margin-bottom: 3%;
    margin-top: 3%;
}
.ppp{
    width: 80%;
    margin-left: 3%;
    font-size: 25px;
    margin-top: 2%;
    // border: 1px dashed black;
}
.xx{
    display: block; /* 確保底線延伸到邊界 */
    width: 100%;
    height: 5dvh;
    font-size: 30px;
    margin-left: 1%;
    margin-top: 2%;
    border-bottom: 1px dashed black;
    box-sizing: border-box; /* 確保寬度計算包括邊框和內邊距 */
}

.ppp1 {
    display: flex;
    align-items: center;
    font-size: 25px;
    width: 80%;
    height: 5dvh;
    margin-left: 3%;
    margin-top: 2%;
}

.ppp1 span {
    white-space: nowrap; /* 確保文本不換行 */
    height: 5dvh;
    margin-top: 2%;
}

.xx1 {
    display: inline-block;
    width: auto;
    height: 5dvh;
    font-size: 25px;
    border-bottom: 1px dashed black;
    margin-left: 10px;
    margin-right: 10px;
    padding: 0 5px; /* 增加 padding 以擴展底線寬度 */
    margin-top: 2%;
}

.spacer {
    flex-grow: 1; /* 填充中間的空白區域 */
}

.question-item {
    width: 80%;
    margin: 0 auto;
    font-size: 25px;
    margin-bottom: 5%;
    padding: 5px;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    margin-top: 2%;

}

.ttt{
    color: black;
    margin-top: 3%
}
.ttt .required {
    color: red; /* 紅色文字 */
}
.textt{
    width:100%;
    margin: 0 auto; /* 將元素置中 */
    display: block; /* 確保textarea是區塊元素，這樣margin: 0 auto;才會生效 */
    margin-top: 1%
}


.buttonArea {
    display: flex;
    justify-content: space-between;
    max-width: 800px;
    margin: 20px auto;
}

.buttonArea .t1 {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    transition: background-color 0.3s;
}

.buttonArea .t1:hover {
    background-color: #0056b3;
}

</style>