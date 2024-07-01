<script>
import { RouterLink, RouterView } from 'vue-router'
export default{
    components:{
        RouterLink
    }
}
</script>

<template>
<div class="headerArea">
    <RouterLink class="tt" to="/">前台</RouterLink>
    <RouterLink class="tt" to="/Quiz">後台</RouterLink>
    
    <!-- <RouterLink to="/Create"></RouterLink>
    <RouterLink to="/Create_Preview"></RouterLink>
    <RouterLink to="/Edit_Quiz"></RouterLink>
    <RouterLink to="/Edit_Update"></RouterLink>
    <RouterLink to="/Fillin"></RouterLink>
    <RouterLink to="/Feedback"></RouterLink> -->
</div>
</template>


<style scoped lang="scss">
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    // background-color: #a8f3d438;
}
.headerArea{
    margin: 0;
    padding: 0;
    width: 100%;
    height: 10dvh;    
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #a8f3d438;
    // background: rgb(255, 255, 255);
}

.tt{
    width: 6%;
    font-size: 30px;
    font-weight: 200px;
    margin: 5%;
    color: black;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover{
        border: 1px solid rgba(0, 0, 0, 0.274) ;
        background: rgb(255, 197, 197);
    }

}
</style>