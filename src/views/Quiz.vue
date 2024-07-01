<script>
import { RouterLink } from 'vue-router';
import Swal from 'sweetalert2';
export default{
    data(){
        return{
            quizAtt:[],
            loading :true,

            //資料庫抓取資料進來
            quizId:[],
            quizTitle:"",
            quizStartDate:"",
            quizEndDate:"",
            //刪除資料放入
            inputId:[],
            //選擇狀態
            selectedStatus:'',

            // 搜索都用v-show的方式
            // 當條件符合時顯示符合條件，不符合時顯示全部
            // 搜索列
            // (1)存放關鍵字
            searchQuiz:"",
            // (2)v-show 全部選項時為A  ，搜索成功後跳轉B
            searchQuizVShow:"A",
            // 日期
            // (1)開始時間
            // 存方開始時間
            startDateQuiz:"",
            // (2)結束時間
            endDateQuiz:"",
            dateQuizVShow:"111",


            // 上下一頁
            prev:0,
            next:10,

            // 設定選擇頁碼
            selectedPage: 1,
            totalPages: 0,//每頁有十筆資料,先隨便預設個數值
        }

    },
    mounted(){
        this.quiz();
        this.selectedPage = 1; // 確保刷新頁面後在第一頁
    },
    methods:{
        quiz(){
            this.loading = true; 
            let testobj={
                "name":this.quizTitle,
                "start_date":this.quizStartDate,
                "end_date":this.quizEndDate
            }
            
            fetch("http://localhost:8080/quiz/search",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(testobj)
            })
            .then(res=>res.json())
            .then(data=>{
                this.quizAtt = data.quizList.map(item => ({
                ...item,
                status: this.setState(item)
            }));
                this.loading = false; 
                console.log(data);
            })
            .catch(error => {
                console.error('資訊錯誤:', error);
                this.loading = false;
            });
            
        },
        quizDelete(){
            if (this.inputId.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: '你未有選項刪除'
                });
                return;
            }
            let deleteData={
                "id_List":this.inputId
            }
            fetch("http://localhost:8080/quiz/delete",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(deleteData)
            })
            .then(res=>res.json())
            .then(data=>{
                console.log('Delete response:', data);
                if (data.code === 200) {
                // this.quizAtt = this.quizAtt.filter(item => !this.inputId.includes(item.id));
                this.inputId = [];
                this.quiz();
                Swal.fire({
                        icon: 'success',
                        title: '刪除成功'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '刪除失敗',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                console.error('資訊錯誤:', error);
                Swal.fire({
                    icon: 'error',
                    title: '刪除時發生錯誤'
                });
            });
        },

        // 搜索
        searchAll(){
            if(this.searchQuiz.length<1){
                this.searchQuizVShow="A"
            }else{
                this.searchQuizVShow="B"
            }
            this.firstPage();
        },
        // 設定如果按了打叉或者刪除文字後，可以正常地跳回"A"
        cancelSearch(){
            this.searchVshow = 'A';
            this.searchQuiz = ''; // 搜索框清空時,也跳回A
            this.selectedPage = 1;
        },
        // 日期
        dateQuiz(){
            // 檢查日期是否有效
            const isValidDate = (date) => date && !isNaN(new Date(date).getTime());
            // (isValidDate(this.startDateQuiz) && isValidDate(this.endDateQuiz) && this.startDateQuiz <= this.endDateQuiz)  :開始日期與結束日期都是有效的，且開始日期小於結束日期
            // (isValidDate(this.startDateQuiz) && !isValidDate(this.endDateQuiz)) : 開始日期有效，結束日期無效(即位填寫/錯誤格式)
            // (!isValidDate(this.startDateQuiz) && isValidDate(this.endDateQuiz)) : 開始日期無效，結束日期有效
            // (!this.startDateQuiz && !this.endDateQuiz)  : 開始時間和結束時間皆為空時
            if((isValidDate(this.startDateQuiz) && isValidDate(this.endDateQuiz) && this.startDateQuiz <= this.endDateQuiz) ||
            (isValidDate(this.startDateQuiz) && !isValidDate(this.endDateQuiz)) ||
            (!isValidDate(this.startDateQuiz) && isValidDate(this.endDateQuiz)) ||
            (!this.startDateQuiz && !this.endDateQuiz) ){
                if(!isValidDate(this.startDateQuiz) && !isValidDate(this.endDateQuiz)){
                    this.dateQuizVShow="111"
                }else{
                    this.dateQuizVShow="222"
                }
            }else{
                Swal.fire({
                    icon: 'error',
                    title: '日期輸入錯誤'
                });
                this.startDateQuiz='';
                this.endDateQuiz='';
            }
        },
        clearButton(){
            this.searchQuiz = '';
            this.startDateQuiz='';
            this.endDateQuiz='';
            this.selectedStatus='';
        },

        // 根據時間去設置狀態   ，狀態分別為 : 尚未發布  ; 已發布 : 已結束、進行中、尚未開始
        setState(item){

            //檢查item對象的結構和屬性
            // console.log("Item:", item); 
            const now = new Date();
            //檢查當前時間
            // console.log("Now:", now);
            
            const startDate = new Date(item.startDate);
            const endDate = new Date(item.endDate);
            //檢查開始時間和結束時間
            // console.log("Start Date:", startDate); 
            // console.log("End Date:", endDate); 

            
            if (item.published === false) {
                return "尚未發布";
            } else if (item.published === true ) {
                if (now < startDate) {
                return "尚未開始";
                } else if (now >= startDate && now <= endDate) {
                return "進行中";
                } else if (now > endDate) {
                return "已結束";
                }
            }
            return "未知狀態"; // 如果有這些狀態以外的則顯示
            
        },
        feedbackLink(item){
            const state = this.setState(item);
            return state==='已結束' || state ===  "進行中";
        },
        shouldShowEditLink(item) {
            const state = this.setState(item);
            // 只有尚未發布的或者已發布且尚未開始的具有連結
            return state === '尚未發布' || state ===  "尚未開始";
        },
        detelcheck(item) {
            const state = this.setState(item);
            // 只有尚未發布的或者已發布且尚未開始的具有連結
            return state === '尚未發布' || state ===  "尚未開始" || state==='已結束' ;
        },

        // =============================================
        // 新增上下頁功能
        page(index){
            // 當索引值大於等於prev=0時，以及 小於next=10時
            return index >= this.prev && index < this.next;
        },
        // 跳到第一頁
        firstPage(){
            this.prev = 0;
            this.next = 10;
            // 將數值綁定頁碼(最前頁是第一頁所以直接等於1)
            this.selectedPage=1;

            this.scrollToTop();
        },
        // 跳到最後一頁
        lastPage(){
            let totalPages = Math.ceil(this.quizAtt.length / 10);
            this.prev = (this.totalPages - 1) * 10;
            this.next = this.filteredAtt.length;
            // 最後一頁就是totalPages，每頁除10的頁碼總數
            this.selectedPage=totalPages;
            this.scrollToTop();
        },
        // 上一頁
        prevPage() {
            if (this.prev == 0) {
                Swal.fire({
                    icon: 'warning',
                    title: '已經是第一頁了!'
                });
            }else{
                const newStart = Math.max(0, this.prev - 10);
                const newEnd = Math.min(this.prev, this.next);
                this.prev = newStart;
                this.next = newEnd;
                // this.prev -= 10;
                // this.next -= 10;
                // 往前一頁為減一
                this.selectedPage--;

                this.scrollToTop();
            }
        },
        // 下一頁，this.end是指當前頁結束的索引位置;this.tainanAtt.length這是指所有景點的總數量
        // 如果為true才會繼續顯示下一頁
        nextPage() {
            if (this.next >= this.filteredAtt.length  ) {
                Swal.fire({
                    icon: 'warning',
                    title: '已經是最後一頁了!'
                });
            }else{
                // this.start這裡的start是指當前的索引位置
                this.prev += 10;
                this.next += 10;
                // 下一頁為加一
                this.selectedPage++;
                // 如果因下一頁造成顯示不足十筆
                if (this.next > this.filteredAtt.length) {
                    this.next = this.filteredAtt.length;
                }

                this.scrollToTop();
            }
        },
        // 選擇頁碼功能
        gotoSelectedPage() {
        // 要重新計算start與end的值
        this.prev = (this.selectedPage - 1) * 10;
        this.next = Math.min(this.prev + 10, this.filteredAtt.length);
        this.scrollToTop();
        },
        // 更新下拉選單的頁碼(做連結)
        updateSelectedPage(event) {
            this.selectedPage = parseInt(event.target.value);
            this.gotoSelectedPage();
        },
        scrollToTop() {
            // window.scrollTo() : 控制閱覽窗口的滾動
            // { top: 0, behavior: 'auto' }：這是 scrollTo 方法的參數，用於指定滾動的目標位置和行為：
            // top: 0 表示將窗口滾動到垂直方向的頂部，也就是網頁的頂部位置。
            // behavior: 'smooth' 表示滾動行為為平滑滾動，也就是會有動畫效果，而不是瞬間跳轉(auto)到頂部。
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },
    },
    computed:{
        filteredAtt(){
            return this.quizAtt.filter((item)=>{
                const searchMath=item.name.includes(this.searchQuiz);
                
                let statusMatch = true;
                if (this.selectedStatus) {
                    statusMatch = item.status === this.selectedStatus;
                }

                let startMath = true;
                let endMath = true;

                // 邏輯 假設 開始日期 6/1 ~ 6/30
                // 當我手動設定開始日期為 6/1 時， 會出現我json檔中的 所有"大於" 6/1的日期  因此，json的日期必須大於等於我手動日期
                // 反之結束日期為 6/30 ，則初先6/30前的所有日期， ，所以需要小於等於手動日期
                // 日期篩選邏輯
                if (this.startDateQuiz) {
                    startMath = new Date(item.startDate) >= new Date(this.startDateQuiz);
                }
                if (this.endDateQuiz) {
                    endMath = new Date(item.endDate) <= new Date(this.endDateQuiz);
                }

                return searchMath && statusMatch && startMath && endMath;
            }).map((item) => {

                // 從 item.questions 解析 questions
                let questions = [];
                try {
                    questions = JSON.parse(item.questions);
                } catch (error) {
                    console.error(`解析 id 為 ${item.id} 的項目的 questions 時出錯`, error);
                }

                return {
                ...item,
                questions: questions,
                status: this.setState(item)
                };
            })
        },
        totalPagesArray(){
            return Array.from({ length: this.totalPages }, (_, index) => index + 1);
        },
        uniqueStatuses() {
            // 使用 Set 來存儲狀態，以確保它們是唯一的
            let statuses = new Set();
            this.quizAtt.forEach(item => {
                statuses.add(item.status);
            });
            // 將 Set 轉換為陣列並返回
            return Array.from(statuses);
        },
        truncatedName() {
            return (name) => {
                if (name.length > 6) {
                return name.substring(0, 6) + '...';
                } else {
                return name;
                }
            };
        }
    },
    // =========================================================
    watch: {
    // 監聽 filteredAtt 陣列的變化
        filteredAtt: {
            handler() {
                // 當 filteredAtt 發生變化時重新計算 totalPages
                this.totalPages = Math.ceil(this.filteredAtt.length / 10);
                this.firstPage();
            },
            // immediate: true 表示在監聽開始時立即調用處理函數
            immediate: true
            },
        },
    components: {
        RouterLink
    }

}
</script>

<template>
    <!-- 搜索區域 -->
    <div class="searchArea">
        <div class="xxxx">
            <div class="aaa">
                <label for="searchName">問卷名稱 </label>
                <input class="searchName" id="searchName" type="search" @input="searchAll" v-model.lazy.trim="searchQuiz"  @clear="cancelSearch" placeholder="輸入欲尋找的問卷名稱" >
            </div>
            <div class="aaa1">問卷狀態 
                <select class="sele" name="statusSelector" id="statusSelector" v-model="selectedStatus">
                    <option value="">狀態列狀態</option>
                    <option v-for="status in uniqueStatuses" :value="status">{{ status }}</option>
                </select>    
            </div>
            <div class="aaa2">
                <label for="searchStartDay">開始時間 </label>
                <input class="searchStartDay" id="searchStartDay" type="date" v-model="startDateQuiz" @change="dateQuiz" > 
                <label for="searchEndDay">結束時間 </label>
                <input class="searchEndDay" id="searchEndDay" type="date" v-model="endDateQuiz" @change="dateQuiz">
            </div> 
        </div>
        
        <div class="clearButton">
            <button class="clearbu" @click="clearButton" >清除搜索 </button>
        </div>    
    </div>

    
    
    <!-- 問卷區域 -->
    <div class="questionnaire"> 
        <!-- 第一區域 勾選區、問卷編碼、名稱、狀態、開始時間、結束時間、結果 -->
        <div class="tittleArea">
            <div class="check" >
                <!-- 刪除按鈕 -->
                <button class="bu butt" @click="quizDelete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <!-- 新增按鈕 -->
                <RouterLink :to="{ name: 'Create' }" class="create-button">
                    <button class="bu butt1">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </RouterLink>    
            </div>
            <div class="quizAi">問卷編碼</div>
            <div class="quizName">名稱</div>
            <div class="statuses">問卷狀態</div>
            <div class="quizStartDay">開始時間</div>
            <div class="quizEndDay">結束時間</div>
            <div class="quizResult">問卷結果</div>
        </div>


        <!-- 第二區域 將資料匯入-->
        <div class="material" v-for="(item,index) in filteredAtt " v-show="page(index) && searchQuizVShow && dateQuizVShow"  :key="item.id" >
            <div class="check" v-if="detelcheck(item)">
                <input :id="'checkbox-' + item.id" class="checkboxId checkboxId1" type="checkbox" v-model="inputId" :value="item.id">
                <label :for="'checkbox-' + item.id" ></label>
            </div>
            <div class="check" v-else>
                <input :id="'checkbox-' + item.id" class="checkboxId" type="checkbox" v-model="inputId" :value="item.id" disabled>
                <label :for="'checkbox-' + item.id" ></label>
            </div>

            <div class="quizAi">{{ item.id }}</div>

            <div class="quizName">
            <!-- 點擊name時可以進入資料閱覽(create_preview) -->
                <RouterLink v-if="shouldShowEditLink(item)" :to="{ name: 'Edit_Quiz', query: { data: JSON.stringify(item) } }">
                    <div class="quizName1 quizName3">{{ truncatedName(item.name) }}</div>
                </RouterLink>
                
                <div v-else class="quizName1">{{ truncatedName(item.name) }}</div>
            </div>

            <div class="statuses">{{item.status}}</div>
            <div class="quizStartDay">{{ item.startDate }}</div>
            <div class="quizEndDay">{{ item.endDate }}</div>

            <div class=" quizResultArea ">
                <RouterLink v-if="feedbackLink(item)" :to="{ name: 'Quiz_Feedback', query: { data: JSON.stringify(item) } }">
                    <i class="fa-solid fa-chart-column  ii"></i>
                </RouterLink>    
                
                <div v-else><i class="fa-solid fa-chart-column iii"></i></div>
            </div>  
        </div>

    </div>


    <div class="pageArea">
        <button class="firstPage page" @click="firstPage"  ><i class="fa-solid fa-angles-left"></i></button>
        <button class="prevPage page" @click="prevPage"><i class="fa-solid fa-angle-left"></i></button>
        <select class="selectPage page" v-model="selectedPage" @change="updateSelectedPage">
            <option v-for="page in totalPagesArray" :value="page">{{ page }}</option>
        </select>
        <button class="nextPage page" @click="nextPage"><i class="fa-solid fa-angle-right"></i></button>
        <button class="lastPage page" @click="lastPage"><i class="fa-solid fa-angles-right"></i></button>
    </div>

</template>

<style scoped lang="scss">

.searchArea{
    width: 80%;
    margin: 0 auto;
    display: flex;
    // flex-direction: column;
    margin-top: 2%;
    margin-bottom: 1.5%;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.747);
}

.xxxx{
    width: 80%;
    margin-bottom: 1%;
    // border: 1px solid black
}
.aaa{
    width: 80%;
    margin: 0 auto;
    font-size: 30px;
    margin-top: 1%;
    // border: 1px solid black
}
.searchName{
    font-size: 30px;
    margin-top: 1%;
}
.aaa1{
    width: 80%;
    margin: 0 auto;
    font-size: 30px;
    margin-top: 1%;
    // border: 1px solid black
}
.sele{
    font-size: 30px;
    margin-top: 1%;
    cursor: pointer;
}
.aaa2{
    width: 80%;
    margin: 0 auto;
    font-size: 30px;
    margin-top: 1%;
    // border: 1px solid black
}
.searchStartDay,.searchEndDay{
    font-size: 25px;
    margin-top: 1%;
    cursor: pointer;
}

.clearButton{
    display: flex;
    justify-content: center;
    align-items: center;
}
.clearbu{
    width: 150px;
    height: 60px;
    font-size: 25px;
    background-color: rgba(255, 255, 255, 0);
    background: none;
    border: 1px dashed rgba(0, 0, 0, 0.401); /* 使用虛線邊框 */
    padding: 0;
    cursor: pointer;
    color: #3333338a; 
}

.questionnaire {
    width: 80%; /* 留5%的邊距 */
    margin: 0 auto; /* 水平居中 */
    display: flex;
    flex-direction: column;
    // border: 1px solid black
    
}

.tittleArea, .material {
    height: 8dvh;
    display: flex;
    // justify-content: space-between;
    justify-content: left;
    align-items: center;
    border-bottom: 1px solid #aaa8a8; /* 分隔線 */
    padding: 5px 0; /* 縮小間距 */
    font-size: 20px; /* 字體大小 */
    box-sizing: border-box; /* 確保內邊距和邊框被包括在總寬度內 */
    
}

.check {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 5%; /* 占比5% */
    box-sizing: border-box; /* 確保內邊距和邊框被包括在總寬度內 */
    margin-left: 1%;
    // border: 1px solid black
    
}

.bu {
    font-size: 30px;
    font-weight: 100;
    background-color: rgba(255, 255, 255, 0); /* 背景透明 */
    border: 1px solid black;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 10px; /* 添加內邊距以增大點擊區域 */
    cursor: pointer;
    margin-right: 10px; /* 增加按鈕間的間距 */

    
}

// .create-button {
//     display: inline-flex;
    
// }

.butt, .butt1 {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.butt:focus, .butt1:focus {
    outline: none;
}

.quizAi, .quizName, .statuses, .quizStartDay, .quizEndDay, .quizResultArea,.quizResult {
    font-size:25px ;
    height: 100%;
    text-align: center; /* 居中顯示 */
    padding: 1px; /* 縮小間距 */
    box-sizing: border-box; /* 確保內邊距和邊框被包括在總寬度內 */
    // border: 1px solid black
}

.quizAi {
    width: 10%; /* 占比10% */
}

.quizName {
    width: 20%; /* 占比10% */
}

.statuses {
    width: 18%; /* 占比10% */
}

.quizStartDay {
    width: 18%; /* 占比10% */
}

.quizEndDay {
    width: 18%; /* 占比10% */
}

.quizResult{
    width: 10%; /* 占比5% */
}

.checkboxId1 {
    cursor: pointer;
}

.quizName3 {
    cursor: pointer;
}

/* 確保兩個區塊對應部分的大小一致 */
.tittleArea > div,
.material > div {
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box; /* 確保內邊距和邊框被包括在總寬度內 */
}

.quizResultArea {
    width: 10%; /* 占比5% */
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box; /* 確保內邊距和邊框被包括在總寬度內 */
    text-align: center;
    // border: 1px solid black
}

.ii {
    font-size: 30px; /* 圖標大小 */
    text-align: center;
    cursor: pointer;
    // border: 1px solid black
}

.iii {
    font-size: 30px; /* 圖標大小 */
    text-align: center;
    // border: 1px solid black
}


.pageArea{
    width: 90%;
    margin: 0 auto;
    display: column;
    justify-content: center;
    align-items: center;
    margin-top: 1%;

    border-top: 1px dashed rgba(0, 0, 0, 0.093)
}

.page{
    font-size: 30px;
    margin-top: 2%;
    margin-bottom: 2%;

}
.firstPage{
    width:80px ;
    margin-left: 35%;
    background-color: #33333300;
    border: 1px solid rgba(0, 0, 0, 0.11);
    cursor: pointer;

    :hover{
        width:78px ;
        background-color: #ffcdcd;
        border: 1px solid  #ffcdcd;
        cursor: pointer;
    }
}
.prevPage,.selectPage
,.nextPage,.lastPage{
    width:80px ;
    margin-left: 1%;
    background-color: #33333300;
    border: 1px solid rgba(0, 0, 0, 0.11);
    cursor: pointer;

    :hover{
        width:78px ;
        background-color: #ffcdcd;
        border: 1px solid  #ffcdcd;
        cursor: pointer;
    }
}
.selectPage{
    width: 80px;
    text-align: center;
    cursor: pointer;
}

</style>