class DropBoxController {
  constructor() {
    this.btnSendFileEl = document.querySelector("#btn-send-file");
    this.inputFilesEl = document.querySelector("#files");
    this.snackModalEl = document.querySelector("#react-snackbar-root");

    this.progressBarEl = this.snackModalEl.querySelector(".mc-progress-bar-fg");
    this.nameFileEl = this.snackModalEl.querySelector(".filename");
    this.timeLeftEl = this.snackModalEl.querySelector(".timeleft");

    this.initEvents();
  }

  initEvents() {
    this.btnSendFileEl.addEventListener("click", (event) => {
      this.inputFilesEl.click();
    });

    this.inputFilesEl.addEventListener("change", (event) => {
      // envia files para upload
      this.uploadTask(event.target.files);
      // abre modal
      this.modalShow();
      // zera o campo files
      this.inputFilesEl.value = "";
    });
  }

  /** toggle modal */
  modalShow(show = true) {
    this.snackModalEl.style.display = show ? "block" : "none";
  }

  uploadTask(files) {
    let promises = [];

    [...files].forEach((file) => {
      promises.push(
        new Promise((resolve, reject) => {
          // formData
          let formData = new FormData();
          formData.append("input-file", file);
          // instância do "ajax" XMLHttpRequest
          const ajax = new XMLHttpRequest();
          // abre a requisição
          ajax.open("POST", "/upload");

          ajax.onload = (event) => {
            // fecha modal
            this.modalShow(false);
            try {
              resolve(JSON.parse(ajax.responseText));
            } catch (e) {
              reject(e);
            }
          };
          // trataiva de erros
          ajax.onerror = (event) => {
            // fecha modal
            this.modalShow(false);
            reject(event);
          };
          // status upload arquivos
          ajax.upload.onprogress = (event) => {
            this.uploadProgress(event, file);
          };
          // hora atual inicio upload
          this.startUploadTime = Date.now();
          // envia os dados
          ajax.send(formData);

          // fetch("/upload", {
          //   method: "POST",
          //   body: formData,
          // })
          //   .then((res) => {
          //     console.log(res);
          //     res.json().then((data) => resolve(data));
          //   })
          //   .catch((e) => reject(e));

          // this.postFormData("/upload", formData)
          //   .then((data) => resolve(data))
          //   .catch((e) => reject(e));
        })
      );
    });

    return Promise.all(promises);
  }

  /** função post com multiplos arquivos */
  async postFormData(url = "", data) {
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    return response.json();
  }

  /** tratativa para upload de arquivos */
  uploadProgress(event, file) {
    const { loaded, total } = event;
    const { name } = file;
    // porcentagem upload
    const porcent = parseInt((loaded / total) * 100);
    // tempo gasto upload
    const timespent = Date.now() - this.startUploadTime;
    // tempo restante
    const timeleft = ((100 - porcent) * timespent) / porcent;
    // barra progresso el
    this.progressBarEl.style.width = `${porcent}%`;
    // texto nome do arquivo el
    this.nameFileEl.textContent = name;
    // texto tempo restante el
    this.timeLeftEl.textContent = this.formatTimeToHuman(timeleft);
    // fecha modal e reinicia componentes
  }

  /** formata milesegundos de forma amigável */
  formatTimeToHuman(duration) {
    // converte milesegundos em segundos
    const seconds = parseInt((duration / 1000) % 60);
    // converte milesegundos em minutos
    const minutes = parseInt((duration / (1000 * 60)) % 60);
    // converte milesegundos em horas
    const hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    // determina qual msg será exibida
    if (hours > 0) {
      return `${hours} horas, ${minutes} minutos e ${seconds} segundos`;
    } else if (minutes > 0) {
      return `${minutes} minutos e ${seconds} segundos`;
    } else if (seconds > 0) {
      return `${seconds} segundos`;
    } else {
      return "instantes";
    }
  }
}
