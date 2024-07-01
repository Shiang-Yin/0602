<script>
import { Chart } from 'chart.js/auto';

export default{
    data(){
        return{
            quizData: {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            questions: []
            },
            statistics:{},
            textStatistics:{},
            ans:[]
        }
    },
    created() {
        if (this.$route.query.data) {
            try {
                this.quizData = JSON.parse(this.$route.query.data);

                // 确保 this.quizData.questions 是数组，并初始化答案属性
                if (Array.isArray(this.quizData.questions)) {
                    this.quizData.questions = this.quizData.questions.map(q => {
                        if (q.type === 'multiple' || q.type === '多選') {
                            q.answer = [];
                        } else {
                            q.answer = '';
                        }
                        return q;
                    });
                } else {
                    console.error('this.quizData.questions 不是有效的数组:', this.quizData.questions);
                }

                this.feedback();
            } catch (error) {
                console.error('解析 JSON 數據時發生錯誤:', error);
            }
        } else {
            console.error('$route.query.data 中找不到數據');
        }

        // if (this.$route.query.data) {

        //     try {
        //         this.quizData = JSON.parse(this.$route.query.data);
        //         // this.quizData.questions = JSON.parse(this.quizData.questions);
        //         // console.log('Parsed quizData:', this.quizData);
        //         this.quizData.questions = JSON.parse(this.quizData.questions).map(q => {
        //             if (q.type === 'multiple' || q.type === '多選') {
        //                 q.answer = [];
        //             } else {
        //                 q.answer = '';
        //             }
        //             return q;
        //         })
        //         this.feedback();
        //     } catch (error) {
        //         console.error('解析 JSON 數據時發生錯誤:', error);
        //     }
        // } else {
        //     console.error('$route.query.data 中找不到數據');
        // }
    },
    methods:{
        
        feedback(){    

            let testobj={
                quizId:this.quizData.id
            }
            fetch("http://localhost:8080/response/feedback",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(testobj)
            })
            .then(res=>res.json())
            .then(data=>{
                if (data.ansStatistics && Object.keys(data.ansStatistics).length > 0) {
                        this.statistics = data.ansStatistics;
                        this.textStatistics = data.textStatistics; // 直接使用從後端收到的 textStatistics

                        // 数据加载完成后绘制图表
                        this.$nextTick(() => {
                            this.drawCharts();
                        });
                    } else {
                        console.log('未有任何人填答');
                    }
                // if (data.ansStatistics && Object.keys(data.ansStatistics).length > 0) {
                //         this.statistics = data.ansStatistics;
                //         // 解析文字統計數據
                //         this.textStatistics = data.feedbackText.reduce((acc, item) => {
                //             Object.keys(item.textStatistics).forEach(key => {
                //                 if (!acc[key]) {
                //                     acc[key] = [];
                //                 }
                //                 // acc[key] = item.textStatistics[key].split(", ");
                //                 let answers = item.textStatistics[key]; // 這裡的答案原本是字符串，例如 "[回答1, 回答2, 回答3]"
                                
                //                 answers = answers.replace(/^\[|\]$/g, ''); // 去除方括號
                //                 answers = answers.split(', '); // 將回答拆分為數組
                //                 // answers = answers.map(answer => `"${answer}"`); // 在每個答案項目兩側添加雙引號
                //                 answers = answers.map(answer => answer === "" ? "未填寫" : `${answer}`); 
                //                 acc[key]=answers
                //             });
                //             return acc;
                //         }, {});
                //         // 数据加载完成后绘制图表
                //         this.$nextTick(() => {
                //             this.drawCharts();
                //         });

                //     } else {
                //         console.log('未有任何人填答');
                //         return;
                //     }
                // this.statistics=data.ansStatistics;
                // // 解析文字統計數據
                // this.textStatistics = data.feedbackText.reduce((acc, item) => {
                //     Object.keys(item.textStatistics).forEach(key => {
                //         if (!acc[key]) {
                //             acc[key] = [];
                //         }
                //         // acc[key] = item.textStatistics[key].split(", ");
                //         let answers = item.textStatistics[key]; // 這裡的答案原本是字符串，例如 "[回答1, 回答2, 回答3]"
                        
                //         answers = answers.replace(/^\[|\]$/g, ''); // 去除方括號
                //         answers = answers.split(', '); // 將回答拆分為數組
                //         // answers = answers.map(answer => `"${answer}"`); // 在每個答案項目兩側添加雙引號
                //         answers = answers.map(answer => answer === "" ? "未填寫" : `${answer}`); 
                //         acc[key]=answers
                //     });
                //     return acc;
                // }, {});
                // 數據加載完成後，顯示數據統計圖
                // this.drawCharts();
                console.log(data);
                // console.log(this.statistics);
                console.log(this.textStatistics);
            })
            .catch(error => {
                console.error('資訊錯誤:', error);
                this.loading = false;
            });
        },
        //繪圖
        drawCharts() {
            this.quizData.questions.forEach(question => {
                if (question.type === 'single' || question.type === '單選' || question.type === 'multiple' || question.type === '多選') {

                    let options = question.options.split(';');
                    let data = options.map(option => this.statistics[question.id][option] || 0);
                    
                    let ctx = document.getElementById('myChart-' + question.id).getContext('2d');
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                        labels: options,
                        datasets: [{
                                label: question.title,
                                data: data,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                beginAtZero: true
                                }
                            }
                        }
                    });
                }
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
    <!-- <button @click="feedback">API</button> -->
    <p>{{ quizData.id }}</p>
    <p>{{ quizData.name }}</p>
    <p>{{ quizData.description }}</p>
    <div class="pre">   
        {{ quizData.startDate }} ~ {{ quizData.endDate }}
    </div>


    <div v-for="question in quizData.questions" :key="question.id" >
        <p><strong>{{ question.id }}、 {{ question.title }}({{ getQuestionTypeInChinese(question.type) }}) {{ question.is_necessary == true ? '*':''  }}</strong> </p>
        
        <template v-if="question.type === 'text' || question.type === '文字'">
            <div v-for="(texts, questionId) in textStatistics" :key="questionId">
                <div v-for="(text, index) in texts" :key="index">
                    <p><strong>回答 {{ index + 1 }}:</strong> {{ text }}</p>
                </div>
            </div>
            <!-- <div v-for="(text, index) in textStatistics[question.id]" :key="index"> -->
            <!-- <div v-for="(text, index) in textStatistics" :key="index">
                <p><strong>回答 {{ index + 1 }}:</strong> {{ text }}</p>
            </div> -->
            <!-- <div>{{ this.textStatistics }}</div> -->
        </template>
        <template v-else-if="question.type === 'single' || question.type === '單選'">
            <p v-for="option in question.options.split(';')" :key="option">
                <label>{{ option }}</label>
                <!-- <span v-if="statistics[question.id]">{{ statistics[question.id][option] }}</span> -->
                <span  v-if="statistics[question.id] && statistics[question.id][option] !== undefined">{{ statistics[question.id][option] }}</span>
            </p>
            <!-- <div>
                <canvas :id="'myChart-' + question.id"></canvas>
            </div> -->
            <div v-if="statistics[question.id] && Object.keys(statistics[question.id]).length > 0">
                <canvas :id="'myChart-' + question.id"></canvas>
            </div>
            <p v-else>未有任何人填答</p>
        </template>
        <template v-else-if="question.type === 'multiple' || question.type === '多選'">
            <p v-for="option in question.options.split(';')" :key="option"  >
                <label>{{ option }}</label>
                <span v-if="statistics[question.id] && statistics[question.id][option] !== undefined">{{ statistics[question.id][option] }}</span>
                <!-- <span v-if="statistics[question.id] && statistics[question.id][option] !== undefined">{{ statistics[question.id][option] }}</span> -->
            </p>
            <div v-if="statistics[question.id] && Object.keys(statistics[question.id]).length > 0">
                <canvas :id="'myChart-' + question.id"></canvas>
            </div>
            <p v-else>未有任何人填答</p>
        </template>
    </div>
</template>



<style scoped lang="scss">
#myChart {
    width: 100%;
    height: 400px;
}
</style>