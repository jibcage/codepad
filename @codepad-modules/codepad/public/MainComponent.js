import TreeComponent from "/TreeComponent.js";
import HistoryComponent from "/HistoryComponent.js";
import CommitsComponent from "/CommitsComponent.js";

import SettingsComponent from "/SettingsComponent.js";

// https://antoniandre.github.io/splitpanes/
const { Splitpanes, Pane } = splitpanes;
//$store.state.dir==='/' ||
export default {
    template: `
<div>


    <div id="main" v-if="!edit_settings" :class="window_size< 768 ? 'mobile-size':''">
        <div id="topbar" class="">
			<button @click="topmenu=!topmenu" class="btn" v-if="window_size<768"><i class="fas fa-bars"></i></button>
            <div id="center-left-icons" :class="[topmenu ? 'topmenu' : '']">
				
                <div v-if="topmenu || window_size>768" :style="{width :first_panesize+'vw', whiteSpace:'nowrap', overflow:'hidden',marginBottom: '-8px'}" class="d-inline">
                    <button title="Home" class="btn" @click="$store.commit('home'), topmenu=false"><i class="fas fa-home"></i></button>
                    <button title="Shell" class="btn" @click="window.open('/shell'), topmenu=false"><i class="fas fa-terminal"></i></button>
					<button title="Upload" class="btn" v-if="show_button(3)" @click="file(), topmenu=false" :disabled="folderReadonly()"><i class="fas fa-upload"></i></button>
					<button title="Trash folder" v-if="show_button(4)" class="btn" @click="trash_folder_dialog=true, topmenu=false" :disabled="folderReadonly()  || !$store.state.trash"><i class="fas fa-trash"></i></button>

                      <dialog v-if="trash_folder_dialog" class="mono danger dialog" open>Are you sure you want to trash: {{this.$store.state.dir}} <br><br>
                      <button title="Trash folder" class="btn" @click="trash_folder(), topmenu=false, trash_folder_dialog=false" :disabled="folderReadonly()"><i class="fas fa-trash"></i></button> Trash
					  <button title="Cancel" class="btn" @click="topmenu=false, trash_folder_dialog=false""><i class="fas fa-times"></i></button> Cancel
                      </dialog>

					<span v-if="window_size>768">|</span>

					<button title="push" class="btn" @click="push(), topmenu=false" v-if="show_button(5)"><i class="fas fa-code-branch"></i></button>
                    <button title="play" class="btn" v-if="$store.state.settings.PLAY_URL !== false && show_button(6)" @click="url($store.state.settings.PLAY_URL), topmenu=false"><i class="fas fa-play"></i></button>
	                <button title="hot reload" class="btn" @click="url($store.state.settings.HOT_RELOAD_URL), topmenu=false" v-if="$store.state.settings.HOT_RELOAD_URL !== false && show_button(7)"><i class="fas fa-fire"></i></button>
                    <button title="server restart" class="btn" v-if="$store.state.settings.SERVER_RESTART_URL !== false && show_button(8)" @click="url($store.state.settings.SERVER_RESTART_URL), topmenu=false"><i class="fas fa-server" ></i></button>

                </div>
                <div class="d-inline" v-if="topmenu || window_size>768">
					<button title="run" class="btn" @click="run(), topmenu=false"><i class="fas fa-laptop-code"></i></button>
					<button title="Raw view" class="btn" @click="uri('raw'), topmenu=false"><i class="fas fa-desktop"></i></button>
					<button title="Download" class="btn" @click="uri('download'), topmenu=false"><i class="fas fa-file-download"></i></button>

					<button title="Trash file" class="btn" @click="trash_file_dialog = !trash_file_dialog, topmenu=false" :disabled="fileReadonly() || !$store.state.trash"><i class="fas fa-trash"></i></button>

                      <dialog v-if="trash_file_dialog" class="mono danger dialog" open>Are you sure you want to trash: {{this.$store.state.pad}} <br><br>
                      <button title="Trash file" class="btn" @click="trash_file(), topmenu=false, trash_file_dialog=false" :disabled="fileReadonly()"><i class="fas fa-trash"></i></button> Trash
					  <button title="Cancel" class="btn" @click="topmenu=false, trash_file_dialog=false""><i class="fas fa-times"></i></button> Cancel
                      </dialog>

                    <button title="beautify F2" class="btn" @click="beautify(), topmenu=false" :disabled="fileReadonly()"><i class="fas fa-code"></i></button>
                    <div id="top-msg" class="mono">
                        <span :style="{maxWidth: top_msg_w}"><span>{{$store.getters.getPath}}</span></span>
                    </div>
                </div>
            </div>

            
            <div id="right-top-icons">
			<div id="center-top-icons" class="d-inline" v-if="window_size>845">
                <div id="search" class="d-inline">
                    <input id="right_search" v-model="search_input" v-on:keyup.enter="search()" placeholder="Search regexp .." autocomplete="off" />
                    <button title="search and replace" id="right_button" class="btn" :disabled="!search_input" @click="search()"><i class="fa fa-search"></i></button>
                    <input id="right_replace" :disabled="!search_input" v-model="replace_input" v-on:keyup.enter="search()" placeholder="Replace .." autocomplete="off" />
                </div>
            </div>
                <button title="Codepad Settings" class="btn" @click="edit_settings=!edit_settings" style=""><i class="fas fa-wrench"></i></button>
            </div>
        </div>

        <splitpanes v-if="!edit_settings" id="mainpanes" style="height:calc(100vh - 80px)" @resized="first_panesize= $event[0].size;">
            <pane :size="first_panesize">
                <splitpanes horizontal class="leftpane">
                    <pane size="80">
                        <tree-component path="/" class="boxed"/>
                    </pane>
                    <pane size="20"v-if="$store.getters.getHistory" >
                        <history-component v-if="!show_commits" class="boxed" />
                        <commits-component v-if="show_commits" class="boxed" />
                    </pane>
                </splitpanes>
            </pane>
            <pane size="80">
                <splitpanes horizontal>
                    <pane size="80" v-if="$store.getters.getPad">
                        <iframe :src="$store.getters.getPad"></iframe>
                    </pane>
                    <pane size="20" class="bottom-align" style="overflow: auto" id="logs-container">
                        <div class="logs" v-html="$store.getters.getLogs"></div>
                    </pane>
                </splitpanes>
            </pane>
        </splitpanes>

        <div id="logbar">
            <div>
                <button v-if="!show_commits" title="toggle local / commit history" class="btn" @click="show_commits = !show_commits"><i class="fas fa-user"></i></button>
                <button v-if="show_commits" title="toggle local/commit history" class="btn" @click="show_commits = !show_commits"><i class="fab fa-git"></i></button>


                <button v-disabled="!$store.getters.getNtcFilepath" title="Follow latest operation" class="btn" @click="pad($store.getters.getNtcFilepath)">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <span id="notice" class="ellipse " :title="$store.getters.getNtc" @click=""><span>{{$store.getters.getNtc}}</span></span>
            </div>
            <div>
                <div id="logline" class="ellipse" :title="$store.state.logline" @click=""><span>{{$store.state.logline}}</span></div>
            </div>
            <div>
                <button title="static full log in new window" class="btn newwindow" @click="window.open('/log')"><i class="fas fa-border-style"></i></button>
                <button title="static full log in new window" class="btn newwindow" @click="window.open('/log')"><i class="fas fa-grip-lines"></i></button>
                <button title="dynamic last-logs in new window" class="btn newwindow" @click="window.open('/logs')"><i class="fas fa-bars"></i></button>

            </div>
        </div>
    </div>

    <div id="settings_div" v-if="edit_settings" class="mono">
        <div id="topbar">
            <div id="center-left-icons">
				Codepad Settings: {{user}}
			</div>

            <div id="center-top-icons"></div>

            <div id="right-top-icons">
                <button title="Codepad Settings" class="btn" @click="edit_settings=!edit_settings" style=""><i class="fa fa-wrench"></i></button>
            </div>
        </div>
      	<div>
          	<settings-component class="boxed" />
        </div>
    </div>
</div>
`,
    data() {
        return {
            user: ß.USER,
            message: "",
            notice: "Notice",
            search_input: undefined,
            replace_input: undefined,
            first_panesize: 20,
            window_size: window.innerWidth,
            edit_settings: false,
            show_commits: false,
            btn_size: 40,
            topmenu: false,
            trash_folder_dialog: false,
            trash_file_dialog: false
        };
    },
    components: {
        TreeComponent,
        HistoryComponent,
        CommitsComponent,
        SettingsComponent,
        Splitpanes,
        Pane
    },
    computed: {
        top_msg_w() {
            return `calc(${100 - this.first_panesize}vw - 650px)`;
        }
    },
    mounted() {
        let _this = this;
        _this.window_size = window.innerWidth;
        window.onresize = function() {
            _this.window_size = window.innerWidth;
        };
    },
    sockets: {
        logs(log) {
            var container = document.querySelector("#logs-container");
            if (container !== null) container.scrollTop = container.scrollHeight;
        }
    },
    methods: {
        pad(path) {
            this.$store.commit("pad", path);
        },
        run() {
          	var interpreter = '/raw';
            var extension = this.$store.state.pad.split('.').pop();
          	
            if (extension === "sh") interpreter = "bash";
            if (extension === "js") interpreter = "node";
            if (extension === "php") interpreter = "php";
            if (extension === "rb") interpreter = "ruby";
          
            window.open("/" + interpreter + this.$store.state.pad);
        },
        uri(t) {
            window.open("/" + t + this.$store.state.pad);
        },
        url(t) {
            window.open(t);
        },
        beautify(path) {
            if (!path) path = this.$store.state.pad;
            console.log("beautify", path);
            if (!path) return;
            this.$socket.client.emit("beautify", path);
        },
        push() {
            this.$socket.client.emit("exec", "push");
        },
        file() {
            var input = document.createElement("input");
            input.multiple = true;
            input.type = "file";
            input.onchange = e => {
                console.log("file-upload");

                for (var i = 0; i < e.target.files.length; i++) {
                    var file = e.target.files[i];

                    // file.name // the file's name including extension
                    // file.size // the size in bytes
                    // file.type // file type ex. 'application/pdf'

                    this.$socket.client.emit(
                        "file_upload",
                        {
                            path: this.$store.state.dir,
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            file: file
                        },
                        this.fileComplete
                    );
                }
            };

            input.click();
        },
        fileComplete(file, bool) {
            console.log(file + " upload success:", bool);
        },
        trash_file(path) {
            if (!path) path = this.$store.state.pad;
            if (!path) return;
            this.$store.commit("clearpad", path);

            this.$socket.client.emit("path_trash", path, success => {
                if (!success) this.$store.commit("error", path);
            });
        },
        trash_folder(path) {
            if (!path) path = this.$store.state.dir;
            if (!path) return;
            this.$store.commit("cleardir", path);

            this.$socket.client.emit("path_trash", path, success => {
                if (!success) this.$store.commit("error", path);
            });
        },
        play() {
            window.open(this.$store.state.settings.PLAY_URL);
        },
        search() {
            if (this.replace_input) return window.open("/search?find=" + this.search_input + "&replace=" + this.replace_input);
            window.open("/search?find=" + this.search_input);
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            console.log(files[0]);
        },
        folderReadonly() {
            if (this.$store.state.dir === "/") return true;
            if (this.$store.state.folders[this.$store.state.dir]) if (this.$store.state.folders[this.$store.state.dir].ro) return true;
            return false;
        },
        fileReadonly() {
            if (!this.$store.state.pad) return true;
            if (this.$store.state.files[this.$store.state.pad]) if (this.$store.state.files[this.$store.state.pad].ro) return true;
            return false;
        },
        show_button(i) {
            if (this.window_size < 768) return true;
            return ((this.window_size - 5) * this.first_panesize) / 100 > i * this.btn_size;
        }
    }
};

/*

<button title="Upload" class="btn"><i class="fa fa-upload">
<input type="file" @change="onFileChange">
</i></button>




        <splitpanes>
          <pane size="10">

			<splitpanes horizontal>
              <pane size="10">
                 <history-component class="boxed"/>
              </pane>
              <pane size="90">
                 <tree-component path="/" class="boxed"/>
              </pane>
            </splitpanes>

		  </pane>
          <pane size="90">
          
              <splitpanes horizontal :push-other-panes="false" style="height: 100vh">
      <pane size="90">
            <iframe :src="$store.getters.getPad"></iframe>
      </pane>
      <pane size="10">
            <iframe src="/logs" class="boxed"></iframe>
      </pane>
    </splitpanes>
          </pane>
        </splitpanes>




 <div id="topbar">
        <!--button title="files" class="btn" v-click="files()"><i class="fa fa-folder"></i></button-->
        <button title="logs" class="btn" v-click="$root.pad='/logs'"><i class="fa fa-home"></i></button>
        <button title="shell" class="btn" v-click="shell()"><i class="fa fa-terminal"></i></button>
        <button title="beautify F2" class="btn" v-click="beautify()"><i class="fa fa-code"></i></button>
        <button title="push" class="btn" v-click="push()"><i class="fa fa-download"></i></button>
        <button title="logs" class="btn" v-click="logs()"><i class="fa fa-list"></i></button>
        <button title="play" class="btn" v-click="play()"><i class="fa fa-play"></i></button>
        |
        <button title="beautify > push > logs > play" class="btn" v-click="plug_and_play()"><i class="fa fa-refresh"></i></button>
        <!-- custom buttons can be added here -->
        |
        <!-- hot reload is on port 9000 on our systems, you may change it add additional buttons, etc. -->
        <button title="hot-reload:9000" class="btn" v-click="live()"><i class="fa fa-fire"></i></button>
        <button title="restart server process" class="btn" v-click="restart_server()"><i class="fa fa-server"></i></button>
        <!-- -->
        <text v-if="status || pad !== '/logs'" class="status_red_{{status_red}}" id="status">{{status || pad.substring(2) }}</text>
        <form id="search">
            <input id="right_search" v-model="$root.search_input" v-submit="search()" placeholder="Search regexp .." autocomplete="off">
            <button title="search and replace" id="right_button" class="btn" v-disabled="!$root.search_input" v-click="search()"><i class="fa fa-search"></i></button>
            <input id="right_replace" v-disabled="!$root.search_input" v-model="$root.replace_input" v-submit="search()" placeholder="Replace .." autocomplete="off">
        </form>
    </div>

    <div v-controller="treeController" id="filetree" class="filetree">
        <treeview files="files"></treeview>
    </div>

    <div id="paddiv">
        <iframe v-src="{{pad}}" id="padframe"></iframe>
    </div>

<script>
    Split(['#filetree', '#paddiv'], {
    sizes: [20, 80],
    gutterSize: 4,
      cursor: 'col-resize'
    });
</script>

    <div id="logbar">
          <button title="refresh" v-disabled="!$root.ntc.filepath" class="btn" v-click="$root.pad='/p'+$root.ntc.filepath"><i class="fa fa-exchange"></i></button> | 
          <text v-if="notice" class="" id="notice" v-click="$root.pad='/p'+$root.ntc.filepath">{{notice}}</text>
          <text v-if="logline" class="" id="logline" v-bind-html="logline" v-click="$root.pad='/logs'">{{logline}}</text>
    </div>

----------------
// logs in iframe
<iframe src="/logs" class=""></iframe>

    <div>
 	<div id="topbar">
        <button title="logs" class="btn" @click="goto('home')"><i class="fa fa-home"></i></button>	Msg: {{message}} Pad: {{pad}}

    </div>

	<div id="paddiv">
        <iframe :src="$store.getters.getPad" id="padframe"></iframe>
    </div>


    <div id="filetree" class="filetree">    
		 <tree-component path="/" />
    </div>

 	<div id="logbar">
          <button title="refresh" class="btn" @click=""><i class="fa fa-exchange"></i></button> | 
          <text v-if="notice" class="" id="notice" @click="goto(ntc.filepath)">{{notice}}</text>
          <text v-if="logline" class="" id="logline" v-bind-html="logline" @click="goto('/logs')">{{logline}}</text>
    </div>

    </div>
------------------

    <splitpanes horizontal :push-other-panes="false" style="height: 100vh">
      <pane size="90">

        <splitpanes>
          <pane size="10">

			<splitpanes horizontal>
              <pane size="10">
                 <history-component class="boxed"/>
              </pane>
              <pane size="90">
                 <tree-component path="/" class="boxed"/>
              </pane>
            </splitpanes>

		  </pane>
          <pane size="90">
            <iframe :src="$store.getters.getPad"></iframe>
          </pane>
        </splitpanes>

      </pane>
      <pane size="10">

          
            <iframe src="/logs" class="boxed"></iframe>
          
  

      </pane>
    </splitpanes>

*/