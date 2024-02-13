<template>
    <div class="container">
        <button @click="startLogin" class="button">ログイン</button>
        <button @click="checkLogin" class="button">ログイン状況を確認</button>

        <div class="input-group">
            <label for="date">日付選択:</label>
            <input type="date" id="date" v-model="selectedDate" class="input">
        </div>
        <p>選択された日付: {{ selectedDate }}</p>

        <div class="input-group">
            <textarea v-model="inputText" rows="4" class="textarea"></textarea>
            <button @click="handleButtonClick" class="button">予定を追加</button>
        </div>

        <button @click="readTodoList" class="button">予定を表示</button>

        <div class="input-group">
            <textarea v-model="inputText2" class="textarea"></textarea>
            <button @click="inputUserName" class="button">ユーザー名入力</button>
            <button @click="readOtherUserData" class="button">他ユーザーのデータを表示</button>
        </div>

        <button @click="accessCheck" class="button">アクセス権確認</button>
        <button @click="accessButton" class="button">アクセス権付与</button>
        <button @click="accessDeprivationButton" class="button">アクセス権剥奪</button>
        <button @click="publicAccessButton" class="button">パブリックアクセス設定</button>
        <button @click="publicAccessDeprivationButton" class="button">パブリックアクセス解除</button>

        <div class="message">メッセージ: {{ message }}</div>

    </div>
</template>

<style scoped>
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Arial', sans-serif;
}

.message {
    padding: 10px;
    margin-top: 20px;
    border: 1px solid #333;
    background-color: #f5f5f5;
    color: #333;
    border-radius: 5px;
    white-space: pre-wrap;
}

.button {
    display: block;
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    font-size: 16px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.button:hover {
    background-color: #0056b3;
}

.input-group {
    margin: 10px 0;
}

.input, .textarea {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.textarea {
    resize: vertical;
}
</style>



<script>

import {  getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { fetch } from '@inrupt/solid-client-authn-browser'

  // Import from "@inrupt/solid-client"
  import {
    addUrl,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getPodUrlAll,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    removeThing,
    saveSolidDatasetAt,
    setThing,
  } from "@inrupt/solid-client";

  import { universalAccess } from "@inrupt/solid-client";
  
  import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

  import { handleIncomingRedirect, login} from '@inrupt/solid-client-authn-browser';
  //import { acp_ess_2, asUrl } from "@inrupt/solid-client";

export default {
    name: 'Bara',

    data() {
        return {
            selectedDate: null,  // 選択された日付を保持するデータプロパティ
            inputText: '',
            PodUrl: '',
            userName: '',
            message: '',

        };
    },
    components: {

    },
    created() {
        this.completeLogin();


        
    },
    methods: {
        async startLogin() {
            // Start the Login Process if not already logged in.
            if (!getDefaultSession().info.isLoggedIn) {
                await login({
                oidcIssuer: "https://login.inrupt.com",
                redirectUrl: new URL("/", window.location.href).toString(),
                clientName: "My application"
                });
            }
        },
        async inputUserName() {
            this.userName=this.inputText2;
            console.log(this.userName);
        },

        async handleButtonClick() {
            this.updateToDoList(this.inputText);
        },

        async readOtherUserData() {
            this.getOtherUserData(this.userName);
        },
        // アクセス権の確認 データにアクセスできるかどうか
        async accessCheck() {
            universalAccess.getPublicAccess(
            this.PodUrl,   // Resource
            { fetch: fetch }                  // fetch function from authenticated session
            ).then((returnedAccess) => {
            if (returnedAccess === null) {
                console.log("Could not load access details for this Resource.");
                this.message = "アクセス権を確認できませんでした";
            } else {
                console.log("Returned Public Access:: ", JSON.stringify(returnedAccess));
                this.message = "アクセス権を確認しました\n";
                this.message += JSON.stringify(returnedAccess);
            }
            });
        },
        async  checkLogin() {
            
            // Check if logged in. If so, show the user's WebID.
            if (getDefaultSession().info.isLoggedIn) {
                console.log(`login`);
                console.log(`Logged in as ${getDefaultSession().info.webId}`);
                const pods=await getPodUrlAll(getDefaultSession().info.webId,{ fetch: fetch });
                console.log(pods);
                console.log(this.selectedDate);
                this.PodUrl=pods[0]+"KuwaSchedule/"+this.selectedDate+"/";

                this.message = `Logged in as ${getDefaultSession().info.webId}`;
            }
            else{
                console.log(`not login`);
                this.message = `not login`;
            }
        },



        //アクセス権を与えるボタン
        async accessButton() {
            //this.setupPolicyToMatchAgentsAndClients(this.PodUrl);
            this.accessKuwa(this.PodUrl);
            console.log(this.PodUrl);
        },

        async accessDeprivationButton() {
            //this.setupPolicyToMatchAgentsAndClients(this.PodUrl);
            this.accessDeprivationKuwa(this.PodUrl);
            console.log(this.PodUrl);
        },

        //パブリックアクセス権を与えるボタン
        async publicAccessButton() {
            this.publicAccess(this.PodUrl);
            console.log(this.PodUrl);
        },

        //パブリックアクセス権をはく奪するボタン
        async publicAccessDeprivationButton() {
            
            this.publicAccessDeprivation(this.PodUrl);
            console.log(this.PodUrl);
        },




        //アクセス権を与える関数
        async accessKuwa(resourceURL){
            universalAccess.setAgentAccess(
            resourceURL,         // Resource
            "https://id.inrupt.com/"+this.userName,     // Agent
            { read: true, write: false, },          // Access object
            { fetch: fetch }                         // fetch function from authenticated session
            ).then((newAccess) => {
            this.logAccessInfo("https://id.inrupt.com/"+this.userName, newAccess, resourceURL)
            this.message = this.userName + `にアクセス権を与えました`;
            });

        },
        logAccessInfo(agent, agentAccess, resource) {
            console.log(`For resource::: ${resource}`);
            if (agentAccess === null) {
                console.log(`Could not load ${agent}'s access details.`);
            } else {
                console.log(`${agent}'s Access:: ${JSON.stringify(agentAccess)}`);
            }
        },

        //アクセス権をはく奪する関数
        async accessDeprivationKuwa(resourceURL){
            universalAccess.setAgentAccess(
            resourceURL,         // Resource
            "https://id.inrupt.com/"+this.userName,     // Agent
            { read: false, write: false, },          // Access object
            { fetch: fetch }                         // fetch function from authenticated session
            ).then((newAccess) => {
                console.log(`アクセス権をはく奪しました ${JSON.stringify(newAccess)}`);
                this.message = this.userName + `のアクセス権をはく奪しました`;
            });
        },

        //パブリックアクセス権を与える関数
        async publicAccess(resourceURL){
            universalAccess.setPublicAccess(
                resourceURL,  // Resource
                { read: true, write: false },    // Access object
                { fetch: fetch }                 // fetch function from authenticated session
                ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for this Resource.");
                } else {
                    console.log("Returned Public Access:: ", JSON.stringify(newAccess));
                    this.message = `パブリックアクセス権を与えました`;
                }
                });
        },

        //他のユーザーのデータを取得する関数
        async getOtherUserData(userName){ //データを取得したいユーザーの名前を引数にとる
            console.log(userName);

            const pods=await getPodUrlAll("https://id.inrupt.com/"+userName,{ fetch: fetch });
            console.log("ああああ");
            console.log(pods);
            console.log(this.selectedDate);
            this.PodUrl=pods[0]+"KuwaSchedule/"+this.selectedDate+"/";

            // Make authenticated requests by passing `fetch` to the solid-client functions.
            // The user must have logged in as someone with the appropriate access to the specified URL.

            // For example, the user must be someone with Read access to the specified URL.
            const myDataset = await getSolidDataset(
            //"https://storage.inrupt.com/somepod/todolist",
            this.PodUrl,
            { fetch: fetch }
            );
            //console.log(myDataset);

            let items = getThingAll(myDataset);
  
            let listcontent = "";
            for (let i = 0; i < items.length; i++) {
                let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
                if (item !== null) {
                listcontent += item + "\n";
                }
            }

            console.log(listcontent);
            this.message = userName + "のデータを取得しました\n";
            this.message+=listcontent;
        },

        //パブリックアクセス権をはく奪する関数
        async publicAccessDeprivation(resourceURL){
            universalAccess.setPublicAccess(
                resourceURL,  // Resource
                { read: false, write: false },    // Access object
                { fetch: fetch }                 // fetch function from authenticated session
                ).then((newAccess) => {
                if (newAccess === null) {
                    console.log("Could not load access details for this Resource.");
                } else {
                    console.log("Returned Public Access:: ", JSON.stringify(newAccess));
                    this.message = `パブリックアクセス権をはく奪しました`;
                }
                });
        },



        async  completeLogin() {
            await handleIncomingRedirect();
        },
        async readTodoList() {
            const pods=await getPodUrlAll(getDefaultSession().info.webId,{ fetch: fetch });
            
            console.log(pods);
            console.log(this.selectedDate);
            this.PodUrl=pods[0]+"KuwaSchedule/"+this.selectedDate+"/";

            // Make authenticated requests by passing `fetch` to the solid-client functions.
            // The user must have logged in as someone with the appropriate access to the specified URL.

            // For example, the user must be someone with Read access to the specified URL.
            const myDataset = await getSolidDataset(
            //"https://storage.inrupt.com/somepod/todolist",
            this.PodUrl,
            { fetch: fetch }
            );
            //console.log(myDataset);

            let items = getThingAll(myDataset);
  
            let listcontent = "";
            for (let i = 0; i < items.length; i++) {
                let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
                if (item !== null) {
                listcontent += item + "\n";
                }
            }

            console.log(listcontent);
            this.message = "データを取得しました\n";
            this.message+=listcontent;

            //this.ReadData = myDataset;
        },
        async updateToDoList(myChangedDataset) {
            const pods=await getPodUrlAll(getDefaultSession().info.webId,{ fetch: fetch });
            console.log(pods);
            console.log(this.selectedDate);
            this.PodUrl=pods[0]+"KuwaSchedule/"+this.selectedDate+"/";
        // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
            // In practice, you should add in your profile a link to this resource
            // such that applications can follow to find your list.
            const readingListUrl = this.PodUrl;

            console.log(readingListUrl);

        
            let titles = myChangedDataset.split("\n");
        
            // Fetch or create a new reading list.
            let myReadingList;
        
            try {
            // Attempt to retrieve the reading list in case it already exists.
            myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
            // Clear the list to override the whole list
            let items = getThingAll(myReadingList);
            items.forEach((item) => {
                myReadingList = removeThing(myReadingList, item);
            });
            } catch (error) {
            if (typeof error.statusCode === "number" && error.statusCode === 404) {
                // if not found, create a new SolidDataset (i.e., the reading list)
                myReadingList = createSolidDataset();
            } else {
                console.error(error.message);
            }
            }
        
            // Add titles to the Dataset
            let i = 0;
            titles.forEach((title) => {
            if (title.trim() !== "") {
                let item = createThing({ name: "title" + i });
                item = addUrl(item, RDF.type, AS.Article);
                item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
                myReadingList = setThing(myReadingList, item);
                i++;
            }
            });
        
            try {
            // Save the SolidDataset
            let savedReadingList = await saveSolidDatasetAt(
                readingListUrl,
                myReadingList,
                { fetch: fetch }
            );
        
            console.log(savedReadingList);
    
            } catch (error) {
            console.log(error);
            }
        }



    },
}
</script>
  