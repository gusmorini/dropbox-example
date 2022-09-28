class DropBoxController {
  constructor() {
    this.btnSendFileEl = document.querySelector("#btn-send-file");
    this.inputFilesEl = document.querySelector("#files");
    this.snackModalEl = document.querySelector("#react-snackbar-root");

    this.initEvents();
  }

  initEvents() {
    this.btnSendFileEl.addEventListener("click", (event) => {
      this.inputFilesEl.click();
    });

    this.inputFilesEl.addEventListener("change", (event) => {
      this.uploadTask(event.target.files);
      this.snackModalEl.style.display = "block";
    });
  }

  uploadTask(files) {
    let promises = [];

    [...files].forEach((file) => {
      promises.push(
        new Promise((resolve, reject) => {
          let formData = new FormData();
          formData.append("input-file", file);

          // let ajax = new XMLHttpRequest();
          // ajax.open("POST", "/upload");
          // ajax.onload = (event) => {
          //   try {
          //     resolve(JSON.parse(ajax.responseText));
          //   } catch (e) {
          //     reject(e);
          //   }
          // };
          // ajax.onerror = (event) => {
          //   reject(event);
          // };
          // ajax.send(formData);

          // fetch("/upload", {
          //   method: "POST",
          //   body: formData,
          // })
          //   .then((res) => {
          //     res.json().then((data) => resolve(data));
          //   })
          //   .catch((e) => reject(e));

          this.postFormData("/upload", formData)
            .then((data) => resolve(data))
            .catch((e) => reject(e));
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
}
