<script>
import Swal from 'sweetalert2';
export default {
    data() {
        return {
            quizData: {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            questions: []
            },
            inputquestion: '',
            inputisNecessary: false,
            inputoption: '',
            inputselectType: '',
            minStartDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
            editingQuestionId: null,
            editingMode: false ,
            typeMap: {
                'single': '單選',
                'multiple': '多選',
                'text': '文字',
                '單選': 'single',
                '多選': 'multiple',
                '文字': 'text'
            }
        };
    },
    created() {
        if (this.$route.query.data) {
            try {
                this.quizData = JSON.parse(this.$route.query.data);
                // 解析 questions 字段
                this.quizData.questions = this.quizData.questions.map(q => ({
                    ...q,
                    options: q.options.split(';'),
            }));
            } catch (error) {
            console.error('解析 JSON 數據時發生錯誤:', error);
            }
        } else {
            console.error('$route.query.data 中找不到數據');
        }
    },
    methods: {
        handleReviseButtonClick(question) {
            // 首先進行編輯的提交檢查
            if (this.editingQuestionId !== null) {
                const editingQuestion = this.quizData.questions.find(q => q.id === this.editingQuestionId);
                if (!editingQuestion) {
                    console.error('找不到正在編輯的問題');
                    return;
                }
                
                // 檢查必填信息是否已填寫
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
            }

            if (this.editingQuestionId === question.id) {
                // 如果再次點擊已選中的題目，則取消編輯模式
                this.editingQuestionId = null;
                this.editingMode = false;
                this.clearInputFields();
            } else {
                // 否則進入編輯模式
                this.editingQuestionId = question.id;
                this.inputquestion = question.title;
                this.inputisNecessary = question.is_necessary;
                this.inputoption = question.options.join(';');
                this.inputselectType = this.typeMap[question.type] || question.type;
                this.editingMode = true;
            }
        },

        clearInputFields() {
            this.inputquestion = '';
            this.inputisNecessary = false;
            this.inputoption = '';
            this.inputselectType = '';
        },
        updateQuestion() {
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

            const question = this.quizData.questions.find(q => q.id === this.editingQuestionId);
            if (question) {
            question.title = this.inputquestion;
            question.is_necessary = this.inputisNecessary;
            question.options = this.inputoption.split(';');
            // question.type = this.inputselectType;
            question.type = this.typeMap[this.inputselectType] || this.inputselectType; // 將類型從中文轉換為英文
            }
            this.editingQuestionId = null;
            this.editingMode = false;
            this.clearInputFields();

            Swal.fire({
                icon: 'success',
                title: '問卷題目已成功更新',
                timer: 800,  // 顯示時間（毫秒），例如 3000 表示 3 秒
                timerProgressBar: true,  // 顯示計時進度條
                showConfirmButton: false  // 隱藏確認按鈕，讓消息自動消失
            });
        },
        addQuestion() {
            if (!this.inputquestion || !this.inputselectType) {
                Swal.fire({
                    icon: 'error',
                    title: '請填寫問卷題目並選擇題目類型'
                });
                return;
            }

            if(this.inputselectType!="text"  && !this.inputoption){
                Swal.fire({
                    icon: 'error',
                    title: '單選或多選，需要輸入選項(用分號隔開)'
                });
                return;
            }

            let options = "";
            if (this.inputselectType != "text") {
                options = this.inputoption;
            }
            const newQuestion = {
                id: this.quizData.questions.length + 1, // 自增ID
                title: this.inputquestion,
                options: this.inputoption.split(';'),
                is_necessary: this.inputisNecessary,
                // type: this.inputselectType
                type: this.typeMap[this.inputselectType] || this.inputselectType // 將類型從中文轉換為英文 // 將類型從中文轉換為英文
            };
            this.quizData.questions.push(newQuestion);
            this.clearInputFields();
            this.editingMode = false; // 重置编辑模式

            Swal.fire({
                icon: 'success',
                title: '問卷題目已成功新增',
                timer: 800,  // 顯示時間（毫秒），例如 3000 表示 3 秒
                timerProgressBar: true,  // 顯示計時進度條
                showConfirmButton: false  // 隱藏確認按鈕，讓消息自動消失
            });
        },
        handleSubmit() {
            const quizDataCopy = {
                ...this.quizData,
                questions: this.quizData.questions.map(q => ({
                    ...q,
                    options: q.options.join(';')
                }))
            };
            this.$router.push({ name: 'Edit_Quiz', query: { data: JSON.stringify(quizDataCopy) } });
        },
        deleteQuestion(id) {
            this.quizData.questions = this.quizData.questions.filter(question => question.id !== id);
            // 刪除後重新計算ID
            this.quizData.questions.forEach((question, index) => {
                question.id = index + 1;
            })
            
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
        // 計算屬性，將類型從英文轉換為中文
        displayType() {
            return {
                single: '單選',
                multiple: '多選',
                text: '文字'
            };
        },
        // 計算屬性，將是否必填從英文轉換為中文
        displayIsNecessary() {
            return {
                true: '必填',
                false: '非必填'
            };
        }
    }
}
</script>

<template>
<div class="quizArea">
<form @submit.prevent="handleSubmit">
    <div class="bagColor">
        
        <button class="eee1" type="submit">預覽問卷</button>
    

        <div class="big">
            <div class="inputArea">
                <div class="inputTitle">
                    <label for="">輸入標題 :</label>
                    <input class="input1" type="text" v-model="quizData.name" placeholder="請輸入標題*(必填)" required>
                </div>

                <div class="inputDescription">
                    <label for="">詳細說明</label>
                    <input class="input2" type="text" v-model="quizData.description" placeholder="請詳細說明*(必填)" required>
                </div>

                <div class="inputDate">
                    <label for="">開始時間</label>
                    <input class="input3" type="date" v-model="quizData.startDate" :min="minStartDate" required>
                    <label for="">結束時間</label>
                    <input class="input4" type="date" v-model="quizData.endDate" :min="quizData.startDate" required>
                </div>
                
                <div class="addquestion">

                    <div class="addtitle">
                        問卷題目:<input class="input_add" type="text" v-model="inputquestion" placeholder="問卷題目">
                    </div>

                    <div class="addtype">
                        選擇題目類型
                        <select v-model="inputselectType" class="input_add_select">
                            <option value="">選擇類型*</option>
                            <option value="single">單選</option>
                            <option value="multiple">多選</option>
                            <option value="text">文字</option>
                        </select>
                        是否必填(若是請勾選)<input class="input_add1" type="checkbox" v-model="inputisNecessary ">
                    </div>
                    
                    <div v-if="inputselectType=='text'" class="addques">
                    問卷選項:<input type="text" class="input_add2" v-model="inputoption" disabled>
                    </div>
                    <div v-else class="addques">
                    問卷選項:<textarea class="input_add3" type="text" v-model="inputoption" placeholder="問卷選項，請用';'分號隔開">
                        </textarea>
                    </div>
                    
                    <!-- <button type="button" @click="addQuestion">新增題目</button> -->
                    <div class="buttonArea">
                        <button class="input_add_bu" type="button" v-if="!editingMode" @click="addQuestion">新增題目</button>
                        <button class="input_add_bu" type="button" v-if="editingMode" @click="updateQuestion">更新題目</button>
                    </div>

                    
                </div>
            </div>
            


            <div class="rightArea">
                <div class="questionArea" v-for="question in quizData.questions" :key="question.id">

                    <div class="leftinput">
                        <div class="inputId">
                            {{ question.id }}、 {{ question.title }}({{ getQuestionTypeInChinese(question.type) }})
                        </div>
                        <div class="isNecessary">是否必填: {{ displayIsNecessary[question.is_necessary]}}
                        </div>

                        <div class="inputoption">選項: {{ question.options }}
                        </div>
                    </div>    
                    <div class="revise">
                        <button class="bbbb" type="button" @click="handleReviseButtonClick(question)">
                            <i :class="editingQuestionId === question.id ? 'fa-solid fa-lock' : 'fa-solid fa-pen'"></i>
                        </button>
                        <button class="bbb1" type="button" @click="deleteQuestion(question.id)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
</div>
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
    background-color: #ffcaca92;
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
    margin-left: 17%;
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
