<script>
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            quizData: null,
        };
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
            const today = new Date();
            today.setHours(0, 0, 0, 0); // 將時間設置為0點0分0秒，這樣只比較日期部分

            const startDate = new Date(this.quizData.startDate);

            if (startDate <= today) {
                Swal.fire({
                    icon: 'error',
                    title: '日期請重新設定'
                });
                return false;
            }

             // 類型轉換映射表
            const typeMap = {
                'single': '單選',
                'multiple': '多選',
                'text': '文字'
            };

            // console.log("提交前的發佈狀態:", this.quizData.published);
            let updateObj = {
                id:this.quizData.id,
                name: this.quizData.name,
                description: this.quizData.description,
                start_date: this.quizData.startDate,
                end_date: this.quizData.endDate,
                // question_list: this.quizData.questions,
                question_list: this.quizData.questions.map(q => ({
                    ...q,
                    type: typeMap[q.type] || q.type // 將類型從英文轉換為中文
                })),
                is_published: this.quizData.published // 將 published 加入更新對象中
            };

            console.log("資料庫數據:", updateObj);

            fetch("http://localhost:8080/quiz/updateOrCreate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateObj),
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                Swal.fire({
                    icon: 'success',
                    title: '問卷已成功提交'
                });
                
                localStorage.removeItem('formData');
                this.$router.push({ name: 'Quiz' });
            })
            .catch((error) => {
                console.error('提交問卷時發生錯誤:', error);
                Swal.fire({
                    icon: 'error',
                    title: '提交問卷失敗，請重試'
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
    },
    computed: {
        displayIsNecessary() {
            return {
            true: '是',
            false: '否'
            };
        },
    }
};
</script>

<template>
<div class="area">
    <div class="quizArea">
        <h2>問卷預覽</h2>
        <div v-if="quizData"  class="aaa">

            <p class="pppxx">問卷:<strong class="">{{ quizData.id }}</strong> </p>
            <p class="ppp">標題:<strong class="xx"> {{ quizData.name }}</strong></p>
            <p class="ppp">描述:<strong class="xx">{{ quizData.description }}</strong> </p>
            <p class="ppp1">
                <span>開始時間</span>
                <span class="xx1">{{ quizData.startDate }}</span>
                <span class="spacer"></span>
                <span>結束時間</span>
                <span class="xx1">{{ quizData.endDate }}</span>
            </p>

            <div v-for="question in quizData.questions" :key="question.id" class="question-item">
                <div class="ttt">{{question.id}}、 {{ question.title }}({{  getQuestionTypeInChinese(question.type) }})
                        <span v-if="question.is_necessary" class="required">*</span>
                    </div>
                <!-- disabled 有設這個就不能書寫(不能互動，會鎖定) -->
                <!--disabled用法 <p><strong>文字:</strong> <input type="text" disabled></p> -->
                <!-- <p><strong></strong> {{ question.id }}</p> -->
                <!-- <p><strong>題目:</strong> {{ question.title }}</p> -->
                <template v-if="question.type === 'text' || question.type === '文字'">
                    <p><strong>文字:</strong> <textarea class="textt" type="text"></textarea></p>
                </template>
                <template v-else-if="question.type === 'single' || question.type === '單選'">
                <p v-for="option in question.options.split(';')" :key="option" class="option-item">
                    <!-- <input type="radio" :name="'single-option-' + question.id" :value="option" disabled> -->
                    <input type="radio"  :id="option" name="single-option" :value="option">
                    <label :for="option">{{ option }}</label>
                </p>
                </template>
                <template v-else-if="question.type === 'multiple' || question.type === '多選'">
                <p v-for="option in question.options.split(';')" :key="option" class="option-item">
                    <input type="checkbox" :id="option" :value="option" >
                    <label :for="option">{{ option }}</label>
                </p>
                </template>
                <!-- <p><strong>是否必填: </strong> {{ question.is_necessary == true ? '是':'否'  }}</p>
                <p><strong>類型: </strong> {{ question.type  === 'single' ? '單選' : (question.type === 'multiple' ? '多選' : '文字') }}</p> -->
            </div>
            <div class="publishArea">
                <p><strong>發布狀態: </strong><strong> {{ quizData.published == true ? '已發布' : '未發布'  }}</strong></p>
                <!-- 發佈狀態選擇 --> 
                <div class="askArea">
                    <label for="published"><strong>是否要發布，若要發布請打勾:</strong></label>
                    <input type="checkbox" v-model="this.quizData.published" id="published"> 
                    <label for="published"><strong>{{ this.quizData.published ? '要發佈' : '不發佈' }}</strong></label>
                </div>
                
            </div>  
            
        </div>
        <p v-else>正在加載問卷預覽...</p>
    </div>

    <div class="buttonArea">
        <!-- 點擊前往編輯可以再次編輯 -->
        <router-link :to="{ name: 'Edit_Update', query: { data: JSON.stringify(quizData) } }">
            <button class="t1" type="button">前往編輯</button>
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
.pppxx{
    width: 80%;
    margin: 0 auto;
    margin-top: 3%;
    font-size: 25px;
    text-align: center;
}
.ppp{
    width: 80%;
    margin-left: 3%;
    margin-top: 3%;
    font-size: 25px;
    // border: 1px dashed black;
}
.xx{
    display: block; /* 確保底線延伸到邊界 */
    width: 100%;
    height: 5dvh;
    font-size: 30px;
    margin-left: 1%;
    margin-top: 3%;
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
    margin-top: 3%;
}

.ppp1 span {
    white-space: nowrap; /* 確保文本不換行 */
    height: 5dvh;
    margin-top: 3%;
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
    margin-top: 3%;
}

.spacer {
    flex-grow: 1; /* 填充中間的空白區域 */
}

.question-item {
    width: 80%;
    margin: 0 auto;
    font-size: 25px;
    margin-bottom: 2%;
    padding: 5px;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    margin-top: 2%;
}

#option{
    margin-top: 2%;
}
.ttt{
    color: black;
    margin-top: 2%
}
.ttt .required {
    color: red; /* 紅色文字 */
}
.textt{
    width:100%;
    margin: 0 auto; /* 將元素置中 */
    display: block; /* 確保textarea是區塊元素，這樣margin: 0 auto;才會生效 */
    margin-top: 3%
}

.publishArea {
    width: 100%;
    text-align: center; /* 居中顯示文字和複選框 */
    font-size: 25px; /* 字體大小 */
    display: flex;
    flex-direction: column;
    align-items: center; /* 垂直居中複選框 */
    gap: 10px; /* 增加項目之間的間距 */
    margin-top: 3%;
}

.askArea label,
.publishArea input[type="checkbox"] {
    display: inline-block;
    vertical-align: middle; /* 垂直居中對齊 */
    margin-right: 10px; /* 右邊距 10px */
    margin-bottom: 6%
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
