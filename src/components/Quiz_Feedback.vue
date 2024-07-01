<script>
export default {
    data() {
        return {
            quizData: null,
            responseList: [],
            loading: false,
            errorMessage: ''
        };
    },
    created() {
        if (this.$route.query.data) {
            try {
                const routeData = this.$route.query.data;
                console.log('原始數據:', routeData);
                
                this.quizData = typeof routeData === 'string' ? JSON.parse(routeData) : routeData;

                if (typeof this.quizData.questions === 'string') {
                    this.quizData.questions = JSON.parse(this.quizData.questions);
                } else if (!Array.isArray(this.quizData.questions)) {
                    throw new Error('Questions 欄位不是有效的 JSON 字符串或數組');
                }

                // 在成功解析 quizData 之後立即調用 quiz 方法
                this.quiz();
            } catch (error) {
                console.error('解析 JSON 數據時發生錯誤:', error);
            }
        } else {
            console.error('$route.query.data 中找不到數據');
        }
    },
    methods: {
        quiz() {
            this.loading = true; 
            let testobj = {
                "id": this.quizData.id
            };
            
            fetch("http://localhost:8080/response/response", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(testobj)
            })
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    this.responseList = data.responseList.map(response => {
                        return {
                            ...response,
                            fillin: JSON.parse(response.fillin)
                        };
                    });
                } else {
                    console.error('服務器返回錯誤:', data.message);
                    this.errorMessage = data.message;
                }
                this.loading = false;
            })
            .catch(error => {
                console.error('資訊錯誤:', error);
                this.errorMessage = '資訊錯誤: ' + error.message;
                this.loading = false;
            });
        },
        redirectToStatistics() {
            // 這裡可以導航到統計頁面，假設路由名稱為 'Statistics'
            this.$router.push( 'Quiz');
        }
    }
}
</script>

<template>
    <div v-if="quizData" class="card-container">
        <div class="topArea">
            <div class="top1">
                <p class="qq">{{ quizData.id }} <p class="qq1">{{ quizData.startDate }} ~ {{ quizData.endDate }}</p></p>
            </div>
            <p class="qq2"><strong>{{ quizData.name }}</strong> </p>
            <p class="qq3">{{ quizData.description }}</p>
        </div>
        
        <div v-if="loading">加載中...</div>
        <div v-if="errorMessage">{{ errorMessage }}</div>

        <div class="everyoneArea">
            <div v-if="responseList.length>0" class="everyoneArea1">
                <div v-for="response in responseList" :key="response.id" class="response-card">
                    <div>填寫者名子 : {{ response.name }} </div>
                    <div>信箱 : {{ response.email }} </div>
                    <div>電話 : {{ response.phone }}</div>
                    <ul class="ccc">填寫答案
                        <p v-for="fillin in response.fillin" :key="fillin.qId">
                            {{fillin.qId }} : {{ fillin.title }} : {{ fillin.answer }}
                        </p>
                    </ul>
                    <div>填寫時間:{{ response.fillinDateTime }}</div>
                </div>
            </div>
            <div v-else class="aax">未有任何人填寫</div>
        </div>
        
    </div>

    <!-- <button v-if="quizData.status == '已結束'" @click="redirectToStatistics">統計</button> -->
    <div class="buttonArea">
        <button class="t1"  @click="redirectToStatistics">返回後台</button>
    </div>
    
</template>

<style scoped>
.card-container {
    width: 98%;
    margin: 0 auto;
    font-size: 20px; /* 設置全域字體大小 */
    margin-top: 2%;
    /* border: 1px solid black; */
}

.topArea{
    width: 90%;
    margin: 0 auto;
}
.top1{
    font-size: 15px;
    text-align: center;
}
.qq2{
    font-size:45px;
    text-align: center;
}
.qq3{
    font-size:30px;
    text-align: center;
}

.everyoneArea {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around; /* 讓元素之間平均分布 */
    align-items: flex-start; /* 元素頂部對齊 */
    /* border-top: 1px dashed rgba(0, 0, 0, 0.389); */
    /* margin-top: 2%; */
    margin-bottom: 1%
}

.everyoneArea1{
    width: 96%;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around; /* 讓元素之間平均分布 */
    align-items: flex-start; /* 元素頂部對齊 */
    border-top: 1px dashed rgba(0, 0, 0, 0.389);
}

.response-card {
    width: 25%;
    border: 3px dashed #e9b0b0;
    padding: 10px;
    margin-top: 1%;
    border-radius: 10px;
    transition: transform 0.3s ease; /* 添加過渡效果 */
}
.response-card:hover {
    transform: scale(1.05); /* 懸停時放大到 105% */
}

.ccc{
    margin: 1%;
    border: 1px dashed rgba(255, 135, 135, 0.756);
    padding: 2%;
    border-radius: 10px;
    transition: transform 0.3s;

    &:hover{
        background-color: white;
        transform: scale(1.3);
    }
}

.aax{
    width: 96%;
    margin: 0 auto;
    font-size: 30px;
    text-align: center;
    border-top: 1px dashed rgba(0, 0, 0, 0.545);
    margin-top: 1%;
    padding-top: 5%
}

.buttonArea .t1 {
    margin: 2%;
    margin-left: 46%;
    margin-top: 3%;
    padding: 10px 20px;
    font-size: 20px;
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
