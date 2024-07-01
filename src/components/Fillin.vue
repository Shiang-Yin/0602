<script>
import Swal from 'sweetalert2';
export default {
    data() {
        return {

            // quizData: null,
            quizData: {
                id:null,
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                questions: []
            },

            // 填寫資料
            fillin_name:"",
            fillin_phone:"",
            fillin_email:"",
            fillin_age:1,
            fillin_fillin:[],  
            

        };
    },
    created() {
        if (this.$route.query.data) {

            try {
                this.quizData = JSON.parse(this.$route.query.data);
                // this.quizData.questions = JSON.parse(this.quizData.questions);
                this.quizData.questions = JSON.parse(this.quizData.questions).map(q => {
                    if (q.type === 'multiple' || q.type === '多選') {
                        q.answer = [];
                    } else {
                        q.answer = '';
                    }
                    if (Array.isArray(q.options)) {
                        q.options = q.options.join(';');
                    }
                    return q;
                });

            } catch (error) {
                console.error('解析 JSON 數據時發生錯誤:', error);
            }
        } else {
            console.error('$route.query.data 中找不到數據');
        }
    },
    methods:{
        
        quiz_response(){    

            let testobj={
                "quiz_id":this.quizData.id,
                "name":this.fillin_name,
                "phone":this.fillin_phone,
                "email":this.fillin_email,
                "age":this.fillin_age,
                "fillin":this.fillin_fillin
            }
            fetch("http://localhost:8080/response/fillinText",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(testobj)
            })
            // .then(res=>res.json())
            .then(res=>{
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
                
            

            .then(data=>{
                if (data.code == 400 && data.message == "duplicated fillin") {
                    Swal.fire('重複填寫', '請勿重複提交相同內容', 'error');
                    return;
                } else if (data.code == 400 && data.message == "is not match!!!") {
                    Swal.fire('答案格式不匹配', '請檢查填寫的答案是否符合要求', 'error');
                    return;
                } else {
                    Swal.fire({
                        title: '提交確認',
                        text: "提交後無法再修改，是否確定送出?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: '確定',
                        cancelButtonText: '取消'
                    }).then((result) => {
                        if (result.isConfirmed) {
                        Swal.fire('送出成功', '您的問卷已成功提交', 'success');
                        this.$router.push('/');
                        }
                    });
                }
                console.log(data);
                // this.$router.push('/');
            })
            .catch(error => {
                console.error('資訊錯誤:', error);
                Swal.fire('提交失敗', '請稍後再試', 'error');
                this.loading = false;
            });
        },
        handleSubmit() {
            // 檢查基本資訊是否填寫 
            if (!this.fillin_name || !this.fillin_phone || !this.fillin_email ) {
                Swal.fire('缺少必填項', '請填寫所有必填基本資訊', 'warning');
                return;
            }
            const phonePattern =/^[0-9]{10}$/;
            if(!phonePattern.test(this.fillin_phone)){
                Swal.fire('手機格式錯誤', '請輸入有效電話號碼', 'warning');
                return;
            }

            // 檢查信箱格式
            // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!this.fillin_email.includes('@')) {
                Swal.fire('信箱格式錯誤', '請輸入有效的信箱地址', 'warning');
                return;
            }

            if(this.fillin_age>100||this.fillin_age<=0){
                Swal.fire('年齡輸入錯誤', '請輸入1~100之間的數', 'warning');
                return;
            }

            // 提交之前檢查題目是否有寫(如果必填，且答案未填)，則停止提交
            for (let question of this.quizData.questions) {
                if (question.is_necessary) {
                    if (question.type === 'text' || question.type === '文字') {
                        if (!question.answer) {
                            Swal.fire('缺少答案', `請填寫必填題目: ${question.title}`, 'warning');
                            return false;
                        }
                    } else {
                        if (!question.answer || (Array.isArray(question.answer) && question.answer.length === 0)) {
                            Swal.fire('缺少答案', `請填寫必填題目: ${question.title}`, 'warning');
                            return false;
                        }

                        // 檢查答案是否匹配選項（排除文字題型）
                        let answerArray = Array.isArray(question.answer) ? question.answer : question.answer.split(';');
                        let optionArray = question.options.split(';');
                        for (let answer of answerArray) {
                            if (!optionArray.includes(answer)) {
                                Swal.fire('答案錯誤', `答案 "${answer}" 不在題目 "${question.title}" 的選項中`, 'warning');
                                return false;
                            }
                        }

                        // 檢查單選題答案長度
                        if (question.type === 'single' || question.type === '單選') {
                            if (answerArray.length > 1) {
                                Swal.fire('答案錯誤', `單選題 "${question.title}" 只能選擇一個答案`, 'warning');
                                return false;
                            }
                        }
                    }
                } else {
                    // 非必填題目處理
                    if (question.answer) {
                        if (question.type !== 'text' && question.type !== '文字') {
                            let answerArray = Array.isArray(question.answer) ? question.answer : question.answer.split(';');
                            let optionArray = question.options.split(';');
                            for (let answer of answerArray) {
                                if (!optionArray.includes(answer)) {
                                    Swal.fire('答案錯誤', `答案 "${answer}" 不在題目 "${question.title}" 的選項中`, 'warning')
                                    return false;
                                }
                            }

                            // 檢查單選題答案長度
                            if (question.type === 'single' || question.type === '單選') {
                                if (answerArray.length > 1) {
                                    Swal.fire('答案錯誤', `單選題 "${question.title}" 只能選擇一個答案`, 'warning');
                                    return false;
                                }
                            }
                        }
                    }
                }
            }

            // 將填寫的答案格式化為後端需要的格式
            this.fillin_fillin = this.quizData.questions.map(question => {
                return {
                    qId: question.id,
                    answer: Array.isArray(question.answer) ? question.answer.join(';') : question.answer
                };
            });

            // 發送數據到後端
            this.quiz_response();
        },
        clearAnswer(index) {
            let question = this.quizData.questions[index];
            if (question.type === 'multiple') {
                question.answer = [];
            } else {
                question.answer = '';
            }
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
    <div class="topArea">
        
        <!-- 問卷id -->
        <div class=" qq">
            <router-link :to="{ name: 'Response'}">
                <button class="t1"><i class="fa-solid fa-tent-arrow-turn-left"></i></button>
            </router-link>
            問卷:
            {{ quizData.id }} 
            <span class="qqq">
            <!-- 開始時間即結束時間 --> 
            {{ quizData.startDate }} ~ {{ quizData.endDate }}
            </span> 
        </div>
    </div>
    <div class="fillinArea">
        
        
        <div class="bigArea">
            <form @submit.prevent="handleSubmit">

                <!-- 問卷標題 -->
                <div class=" q2">
                    <strong>
                        {{ quizData.name }}
                    </strong>
                </div>
                <!-- 問卷詳情 -->
                <div class=" q3">
                    <strong>
                        {{ quizData.description }}
                    </strong>
                </div>
                
                <div class="aaa">
                    <div class="a1">
                        <label for=""><span style="color: red;">*</span> 名子: </label> 
                        <input class="ttt" type="text" name="" id="" v-model="fillin_name" placeholder="輸入名子*" >
                    </div>

                    <div class="a1">
                        <label for=""><span style="color: red;">*</span> 電話: </label>
                        <input class="ttt" type="text" name="" id="" v-model="fillin_phone" pattern="[0-9]{10}" placeholder="十碼電話號碼*" >
                    </div>    

                    <div class="a1">
                        <label for=""><span style="color: red;">*</span> 信箱: </label>
                        <input class="ttt" type="text" name="" id="" v-model="fillin_email" pattern=" [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" placeholder="輸入信箱(應具有@)*"  >
                    </div>

                    <div class="a1">
                        <label for=""><span style="color: red;">*</span> 年齡: </label>
                        <input class="ttt" type="number" name="" id="" v-model="fillin_age"  placeholder="年齡*" >
                    </div>
                </div>


                <div class="questionArea" v-for="(question,index) in quizData.questions" :key="question.id" >
                    
                    <p class="qAq"> {{ question.id }}、 {{ question.title }} ({{ getQuestionTypeInChinese(question.type) }}) 
                        <span v-if="question.is_necessary" class="required">*</span>
                    </p>

                    <template v-if="question.type === 'text' || question.type === '文字'" >
                        <p>
                            <textarea class=" sss1" type="text" placeholder="請輸入文字" v-model="question.answer" ></textarea>
                        </p>
                    </template>
                    <template v-else-if="question.type === 'single' || question.type === '單選'">
                        <button class="buu" type="button" @click="clearAnswer(index)" ><i class="fa-regular fa-square-minus"></i></button>
                        <p v-for="option in question.options.split(';')" :key="option" class="optionContainer">
                            
                            <input class="sss" type="radio" :id="`single-option-${index}-${option}`" name="single-option" :value="option" v-model="question.answer"  >
                            <label :for="`single-option-${index}-${option}`" class="optionLabel">{{ option }}</label>
                        </p>
                    </template>
                    <template v-else-if="question.type === 'multiple' || question.type === '多選'">
                        <p v-for="option in question.options.split(';')"  :key="option" class="optionContainer" >
                            <input class="sss" type="checkbox"  :id="`multiple-option-${index}-${option}`" :value="option" v-model="question.answer" >
                            <label :for="`multiple-option-${index}-${option}`" class="optionLabel">{{ option }}</label>
                        </p>
                    </template>
                </div>
                <div class="buttonArea">
                    <button class="t22" type="submit" >提交問卷</button>
                </div>
                

            </form>
        </div>
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

.topArea{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.qq{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2%;
    position: relative; /* 用於定位按鈕 */
}

.t1 {
    position: absolute; /* 絕對定位 */
    left: 20%; /* 靠左對齊 */
    top:0%;
    margin-left: 10px; /* 添加一些間距 */
    background: transparent; /* 按鈕透明 */
    border: none; /* 移除按鈕邊框 */
    cursor: pointer; /* 鼠標變為手型 */
}

.t1 i {
    margin-top: 0;
    font-size: 24px; /* 放大圖標 */
    color: black; /* 設置圖標顏色為黑色 */
}

.qqq{
    margin-left: 5%;
}

.fillinArea{
    width: 60%;
    margin: 0 auto;
    margin-top: 2%;
    border: 1px dashed rgba(0, 0, 0, 0.364);
    border-radius: 20px;
    background-color: #a7ffda25;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.299); /* 添加陰影 */
    margin-bottom: 3%;
}
.bigArea{
    width: 100%;
    height: auto;
}
.q2{
    font-size: 50px;
    text-align: center;
    margin-top: 2%;;
}
.q3{
    font-size: 30px;
    text-align: center;
    margin-top: 2%;
}

.aaa{
    width: 100%;
    font-size: 28px;
}
.a1{
    display: flex;
    justify-content: left;
    align-items: center;
    margin-left: 20%;
    // border: 1px solid black;
    margin-top: 2%
}
.ttt{
    font-size: 28px;
    width: 60%;
    margin-left: 2%;
    padding: 5px 10px; /* 控制输入框内的填充 */
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    border-bottom: 1px dashed black;
    box-sizing: border-box; /* 确保padding不会影响总宽度 */
    background-color: #c4ffe651;
}

.ttt:focus {
    outline: none; /* 移除输入框聚焦时的默认外边框 */
    background-color: #d4d4d4a1; /* 更改背景颜色以提供视觉反馈 */
}
.questionArea {
    width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: center;
    border: none;
    border-top: 1px dashed rgba(0, 0, 0, 0.508);
    margin-top: 2%;
    font-size: 25px; /* 字體大小設置為25 */
    margin-bottom: 3%
}

.qAq {
    font-size: 25px; /* 字體大小設置為25 */
    margin-bottom: 10px; /* 底部外邊距設置為10像素 */
}
.qAq .required{
    color: red; /* 紅色文字 */
}
.optionContainer {
    width: 60%;
    display: flex;
    align-items: center;
    margin-bottom: 10px; /* 底部外邊距設置為10像素 */
    border: 1px dashed #ff7d7d8b; /* 邊框設置為黑色 */
    padding: 10px; /* 內邊距設置為10像素 */
    cursor: pointer; /* 游標設置為指針樣式 */
    border-radius: 5px; /* 邊框圓角設置為5像素 */
}

.optionLabel {
    width: calc(100% - 40px); /* 留出30px給checkbox/radio */
    display: flex;
    align-items: center;
    font-size: 25px; /* 字體大小設置為25 */
    padding-left: 10px; /* 左側內邊距設置為10像素 */
}

input[type="radio"],
input[type="checkbox"] {
    margin-right: 10px; /* 右側外邊距設置為10像素 */
    transform: scale(1.5); /* 放大勾選框 */
}

input[type="radio"]:checked + .optionLabel,
input[type="checkbox"]:checked + .optionLabel {
    background-color: #e2f2ff98; /* 勾選時背景色設置為淡藍色 */
    border-radius: 10px; /* 邊框圓角設置為5像素 */
}

.sss1 {
    width: 100%;
    height: 100px; /* 高度設置為100像素 */
    font-size: 25px; /* 字體大小設置為25 */
    padding: 10px; /* 內邊距設置為10像素 */
}

.buu {
    font-size: 25px; /* 字體大小設置為25 */
    cursor: pointer; /* 游標設置為指針樣式 */
    background-color: #cccccc00;
    border: none;
}

.buu1 {
    display: block; /* 顯示為區塊元素 */
    width: 100%; /* 寬度設置為100% */
    text-align: center; /* 文字對齊方式設置為居中 */
    font-size: 25px; /* 字體大小設置為25 */
    padding: 10px 20px; /* 內邊距設置為10像素和20像素 */
    cursor: pointer; /* 游標設置為指針樣式 */
}

.buttonArea {
    display: flex;
    justify-content: center;
    max-width: 800px;
    margin: 3% auto;
}

.buttonArea .t22 {
    padding: 10px 20px;
    font-size: 20px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    transition: background-color 0.3s;
}

.buttonArea .t22:hover {
    background-color: #0056b3;
}
</style>