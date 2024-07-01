<script>
import Swal from 'sweetalert2';
export default{
    data(){
        return{
            //創建資料
            create_title:"",
            createObj: null,
            // saveQuizData:null,

            create_description:"",
            minStartDate: "",
            create_startDate:"",
            create_endDate:"",
            create_question:[],
            inputId:"",
            inputquestion:"",
            inputoption:"",
            //多選框綁定布林值(未勾選時是false,勾選後為true)
            inputisNecessary:false,
            inputselectType:"",

            create_isPublished:false,

            editingQuestionId: null,
            editingMode: false


        }
    },
    mounted() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 設置為 ISO 格式的日期字符串，僅保留日期部分
        this.create_startDate = this.formatDate(tomorrow);
        this.create_endDate = this.formatDate(tomorrow);

        this.minStartDate = this.formatDate(tomorrow);

        // Load data from localStorage if available
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
                console.error('解析 JSON 数据时发生错误:', error);
            }
        }
        if (this.$route.query.data) {
            try {
                const savedState = JSON.parse(this.$route.query.data);
                this.create_title = savedState.create_title;
                this.create_description = savedState.create_description;
                this.create_startDate = savedState.create_startDate;
                this.create_endDate = savedState.create_endDate;
                this.create_question = savedState.create_question;
            } catch (error) {
                console.error('解析 JSON 數據時發生錯誤:', error);
            }
        }

        // Reset form data if coming from quiz.vue
        if (this.$route.params.source === 'quiz') {
            this.resetFormData();
        }
    },
    methods:{

        resetFormData() {
            this.create_title = "";
            this.create_description = "";
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.create_startDate = this.formatDate(tomorrow);
            this.create_endDate = this.formatDate(tomorrow);
            this.minStartDate = this.formatDate(tomorrow);
            this.create_question = [];
            this.inputId = "";
            this.inputquestion = "";
            this.inputoption = "";
            this.inputisNecessary = Boolean;
            this.inputselectType = "";
            this.create_isPublished = false;
            this.editingQuestionId = null;
            this.editingMode = false; // 離開編輯模式
            this.clearLocalStorage();
        },
        clearLocalStorage() {
            localStorage.removeItem('formData');
        },

        //問卷標題和詳細內容檢查
        validateMainFields() {
            if (!this.create_title || !this.create_description) {
                Swal.fire({
                    icon: 'error',
                    title: '請填寫問卷內容及問卷詳情'
                });
                return false;
            }
            if (this.create_question.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: '問卷題目未填寫'
                });
                return false;
            }
            return true;
        },

        formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        // 設定日期
        validateDates() {
            const now = new Date();
            const startDate = new Date(this.create_startDate);
            const endDate = new Date(this.create_endDate);

            if (startDate < now || !this.create_startDate) {
                Swal.fire({
                    icon: 'error',
                    title: '時間輸入錯誤',
                    text: '開始日期必須大於今天'
                });
                return false;
            }
            if (endDate < startDate || !this.create_endDate) {
                Swal.fire({
                    icon: 'error',
                    title: '時間輸入錯誤',
                    text: '結束日期必須大於等於開始日期'
                });
                return false;
            }
            return true;
        },

        validateQuestions() {
            for (let i = 0; i < this.create_question.length; i++) {
                if (!this.create_question[i].title || !this.create_question[i].type) {
                    Swal.fire({
                        icon: 'error',
                        title: `請填寫所有問卷題目和選擇題目類型 (題目${i + 1})`
                    });
                    return false;
                }
            }
            return true;
        },

        addQuestion() {
            if (this.editingMode) {
                return;
            }

            if (!this.inputquestion || !this.inputselectType) {
                Swal.fire({
                    icon: 'error',
                    title: '請填寫問卷題目並選擇題目類型'
                });
                return;
            }

            if (this.inputselectType !== "text" && !this.inputoption) {
                Swal.fire({
                    icon: 'error',
                    title: '單選或多選，需要輸入選項(用分號隔開)'
                });
                return;
            }

            // let options = this.inputoption.split(';').map(opt => opt.trim());
            let options = "";
            if (this.inputselectType != "text") {
                options = this.inputoption;
            }

            if (!Array.isArray(this.create_question)) {
                this.create_question = [];
            }

            this.create_question.push({
                id: this.create_question.length + 1, // 自增ID
                title: this.inputquestion,
                options: options,
                is_necessary: this.inputisNecessary,
                type: this.inputselectType
            });

            // 清空输入框
            this.inputquestion = "";
            this.inputoption = "";
            this.inputisNecessary = false;
            this.inputselectType = "";

            Swal.fire({
                icon: 'success',
                title: '問卷題目已成功新增',
                timer: 800,  // 顯示時間（毫秒），例如 3000 表示 3 秒
                timerProgressBar: true,  // 顯示計時進度條
                showConfirmButton: false  // 隱藏確認按鈕，讓消息自動消失
            });
        },
        // ======================================
        editQuestion(question) {
            this.editingQuestionId = question.id;
            this.inputquestion = question.title;
            this.inputoption = question.options;
            // this.inputisNecessary = question.isNecessary;
            this.inputisNecessary = question.is_necessary;
            this.inputselectType = question.type;
            this.editingMode = true; // 進入編輯模式
        },
        saveEditedQuestion() {
            if (!this.checkRevise()) {
                return;
            }
            const question = this.create_question.find(q => q.id === this.editingQuestionId);
            if (question) {
                question.title = this.inputquestion;
                question.options = this.inputoption;
                // question.isNecessary = this.inputisNecessary;
                question.is_necessary = this.inputisNecessary;
                question.type = this.inputselectType;
            }
            this.editingQuestionId = null;
            // 清空輸入框
            this.inputquestion = "";
            this.inputoption = "";
            this.inputisNecessary = false;
            this.inputselectType = "";
            this.editingMode = false; // 離開編輯模式

            Swal.fire({
                icon: 'success',
                title: '問卷題目已成功更新',
                timer: 800,  // 顯示時間（毫秒），例如 3000 表示 3 秒
                timerProgressBar: true,  // 顯示計時進度條
                showConfirmButton: false  // 隱藏確認按鈕，讓消息自動消失
            });
        },
        handleReviseButtonClick(question) {
            if (this.editingQuestionId === question.id) {
                // 編輯模式下點擊 fa-lock 按鈕
                this.handleSaveEditedQuestion();
            } else {
                // 編輯模式下點擊 fa-pen 按鈕
                this.editQuestion(question);
            }
        },
        handleSaveEditedQuestion() {
            if (this.checkRevise()) {
                this.saveEditedQuestion();
            }
        },

        checkRevise() {
            if (!this.inputquestion || !this.inputselectType) {
                Swal.fire({
                    icon: 'error',
                    title: '請填寫問卷題目並選擇題目類型'
                });
                return false;
            }

            if (this.inputselectType !== "text" && !this.inputoption) {
                Swal.fire({
                    icon: 'error',
                    title: '單選或多選，需要輸入選項(用分號隔開)'
                });
                return false;
            }
            return true;
        },
        // ===============================
        handleSubmit(event) {
            event.preventDefault();

            if (!this.validateMainFields() || !this.validateDates()) {
                return;
            }

            let createObj = {
                create_title: this.create_title,
                create_description: this.create_description,
                create_startDate: this.create_startDate,
                create_endDate: this.create_endDate,
                create_question: this.create_question
            };

            // Save form data to localStorage
            localStorage.setItem('formData', JSON.stringify(createObj));

            this.$router.push({ name: 'Create_Preview', query: { data: JSON.stringify(createObj) } });
        },
        deleteQuestion(id) {
            const index = this.create_question.findIndex((q) => q.id === id);
            if (index !== -1) {
                this.create_question.splice(index, 1);
                // 更新其他問題的 ID
                this.create_question.forEach((q, idx) => {
                q.id = idx + 1;
                });
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

    <form @submit.prevent="handleSubmit">

<div class="bagColor">

        <router-link :to="{ name: 'Quiz'}">
            <button class="t22"><i class="fa-solid fa-tent-arrow-turn-left"></i></button>
        </router-link>
        <!-- 取消編輯後跳轉回問卷 -->
        <button class="eee" type="button" @click="resetFormData"  >重新編輯</button>

        <button class="eee1" type="submit">預覽問卷</button>


        <div class="big">

            <div class="inputArea">
                <div class="inputTitle">
                    <label for="">輸入標題 :</label>
                    <input class="input1" type="text" v-model="create_title" placeholder="請輸入標題*(必填)" required>
                </div>    

                <div class="inputDescription">
                    <label for="">詳細說明 : </label>
                    <textarea class="input2" type="text" v-model="create_description" placeholder="請詳細說明*(必填)" required></textarea>
                </div>    

                <div class="inputDate" >
                    <label for="">開始時間</label>
                    <input class="input3" type="date" v-model="create_startDate" :min="minStartDate" required>
                    <label for="">  結束時間</label>
                    <input class="input4" type="date" v-model="create_endDate" :min="this.create_startDate" required>
                </div>

                <!-- 新增提目前需要先看前面題目是否都已填寫 -->
                <div class="addquestion">
                    
                    <div class="addtitle">
                        問卷題目 : <input class="input_add" type="text" v-model="inputquestion" placeholder="問卷題目">
                    </div>  
                    
                    <div class="addtype">
                        選擇題目類型
                        <select v-model="inputselectType" class="input_add_select">
                            <option value="">選擇類型*</option>
                            <option value="single">單選</option>
                            <option value="multiple">多選</option>
                            <option value="text">文字</option>
                        </select>
                        是否必填(若是請勾選) : <input class="input_add1" type="checkbox" v-model="inputisNecessary">
                    </div>  

                    <div class="addques" v-if="inputselectType === 'text'">
                        問卷選項:<input type="text" class="input_add2" v-model="inputoption" disabled>
                    </div>    
                    <div class="addques" v-else>
                        問卷選項:<textarea type="text" class="input_add3" v-model="inputoption" placeholder="問卷選項，請用';'分號隔開"></textarea>
                    </div>
                        
                    

                    <div class="buttonArea">
                        <button class="input_add_bu" type="button" v-if="!editingMode" @click="addQuestion">新增題目</button>
                        <button class="input_add_bu" type="button" v-if="editingMode" @click="saveEditedQuestion">更新題目</button>
                    </div>
                    
                </div>
            </div>
            

            <div class="rightArea">
                
                    <!-- 每新增一個一個問題id都會+1 -->
                    <div class="questionArea" v-for="question in create_question" :key="question.id">
                        <div class="leftinput">
                            <div class="inputId">
                                {{ question.id }}、{{ question.title }}({{ getQuestionTypeInChinese(question.type)   }})
                            </div>    

                            <!-- <div class="inputquestion">題目:
                                
                            </div> -->

                            <!-- <div class="selectType">類型: -->
                                <!-- {{ question.type === 'single' ? '單選' : (question.type === 'multiple' ? '多選' : '文字') }} -->
                                
                            <!-- </div> -->

                            <div class="isNecessary">是否必填:
                                {{ question.is_necessary==false ? '非必填' : '必填' }}
                            </div>    
                            
                            <div class="inputoption">選項:
                                <div>
                                    {{ question.options }}
                                </div>
                            </div>
                        </div>


                        <div class="revise">
                            <!-- 編輯修改 -->
                            <button class="bbbb" type="button" @click="handleReviseButtonClick(question)">
                                <i :class="editingQuestionId === question.id ? 'fa-solid fa-lock' : 'fa-solid fa-pen'"></i>
                            </button>  
                            <!-- 刪除 -->
                            <button class="bbb1" type="button" @click="deleteQuestion(question.id)">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                        </div>
                        
                        
                    </div>
            </div>
            
        </div>

</div>   
    </form>

</template>



<style scoped lang="scss">

.bagColor{
    width: 100%;
    // background-color: #d9f3a8c1;
    background-color: #a8f3d438;
}
.big{
    width: 100%;
    margin-bottom: 3%;
    margin-top: 1%;
    display: flex;
    justify-content: left;
    align-items: center;
}

.inputArea{
    width: 40%;
    margin-left: 2%;
    background-color: #74747494;
    border-radius: 15PX;
}
.inputTitle{
    font-size: 25px;
    margin: 2%;
    margin-top: 3%;
    // border: 1px solid black;
}
.input1{
    width: 80%;
    font-size: 25px;
    margin-left: 1%
}

.inputDescription{
    margin: 2%;
    margin-top: 3%;
    font-size: 25px;
    // border: 1px solid black;
}
.input2{
    width: 98%;
    margin: 0 auto;
    height: 5dvh;
    font-size: 25px;
    margin-left: 1%;
}
.inputDate{
    margin: 2%;
    font-size: 25px;
    margin-top: 3%;
    // border: 1px solid black;
}
.input3,.input4{
    width: 32%;
    margin: 0 auto;
    height: 5dvh;
    font-size: 25px;
    margin-left: 1%;
}


.addquestion{
    margin-top: 4%;
    margin-left: 2%;
    border-top: 1px dashed rgba(0, 0, 0, 0.532);
}

.addtitle{
    font-size: 25px;
    margin-top: 3%;
}
.input_add{
    width: 96%;
    margin: 0 auto;
    font-size: 25px;
    margin-top: 1%
}

.addtype{
    font-size: 25px;
    margin-top: 3%;
}
.input_add_select{
    width: 25%;
    font-size: 25px;
    margin-top: 3%;
    text-align: center;
    margin-right: 1%
}
.input_add1{
    margin-left: 1%;
    width: 20px; /* 調整寬度 */
    height: 20px; /* 調整高度 */
    vertical-align: middle; /* 將 checkbox 垂直居中對齊 */
}

.addques{
    font-size: 25px;
    margin-top: 3%;
}
.input_add2,.input_add3{
    width: 96% ;
    margin: 0 auto;
    font-size: 25px;
    margin-top: 1%
}

.t22 {
    margin-left: 10%; /* 添加一些間距 */
    background: transparent; /* 按鈕透明 */
    border: none; /* 移除按鈕邊框 */
    cursor: pointer; /* 鼠標變為手型 */
}

.t22 i {
    margin-top: 0;
    font-size: 24px; /* 放大圖標 */
    color: black; /* 設置圖標顏色為黑色 */
    color: black; /* 設置圖標顏色為黑色 */
}

.t22:hover {
    transform: scale(1.2); /* 當靠近時放大 */
}

.buttonArea{
    margin-top: 5%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.input_add_bu{
    width: 10dvw;
    height: 8dvh;
    font-size: 30px;
    margin-top: 2%;
    margin-bottom: 3%;
    border-radius: 10px;
    background-color: #fdffb992;
    border: 1px solid #ffcaca92;
    cursor: pointer;
    transition: transform 0.3s; /* 添加平滑過渡效果 */
}
.input_add_bu:hover {
    transform: scale(1.1); /* 當靠近時放大 */
}

// =========================
.rightArea{
    width: 50%;
    // height: 150%;
    margin: 0 auto;
    margin-top: 1%;
    margin-left: 2%;
    margin-right: 2%;
    // border: 1px solid black;
    display: flex;
    // flex-direction: column;
    flex-wrap:wrap;
    justify-content: center ;
    align-items: center;
    border-left: 1px dashed rgba(0, 0, 0, 0.408);

}

.questionArea{
    width:45%;
    height: 20dvh;
    border: 1px solid rgba(0, 0, 0, 0.382);
    margin: 1%;
    margin-left: 3%;
    font-size: 20px;
    background-color: rgba(238, 255, 0, 0.07);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.leftinput{
    width: 80%;
    height: 100%;
    margin-top: 1%;
    margin-left: 1%
}
.inputId,
.isNecessary,
.inputoption{
    margin-top: 2%;
    margin-left: 2%;
    padding-left: 1%;
}

.revise{
    width:90px ;
    background-color: #33333300;
    border: 1px solid rgba(0, 0, 0, 0);
    cursor: pointer;
    display: flex;
    flex-direction: column; /* 使子元素垂直排列 */
    justify-content: flex-start; /* 子元素靠近頂部排列 */

    :hover{
        background-color: #ffcdcd;
        border: 1px solid  #ffcdcd;
        cursor: pointer;
    }
}
.bbbb,.bbb1{
    font-size: 23px;
    margin: 3%;
    border: 2px dashed rgba(0, 0, 0, 0.322) ;
}

.eee{
    width: 10dvw;
    height: 8dvh;
    font-size: 25px;
    margin-top: 1%;
    margin-left: 2%;
    border-radius: 10px;
    background-color: #ffcaca42;
    border: 1px dashed #ffcacaa7;
    cursor: pointer;
    transition: transform 0.3s; /* 添加平滑過渡效果 */
}
.eee1{
    width: 10dvw;
    height: 8dvh;
    font-size: 25px;
    margin-top: 1%;
    margin-bottom: 1%;
    margin-left: 2%;
    border-radius: 10px;
    background-color: #ffcaca42;
    border: 1px dashed #ffcacaa7;
    cursor: pointer;
    transition: transform 0.3s; /* 添加平滑過渡效果 */
}
.eee:hover, .eee1:hover {
    transform: scale(1.1); /* 當靠近時放大 */
}
</style>