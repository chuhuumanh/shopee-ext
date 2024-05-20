import JSZip from 'jszip';

function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations, obs) => {
    if (document.querySelector(selector)) {
      callback();
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

// Chuyển đổi hình ảnh WebP sang PNG hoặc JPEG sử dụng canvas
function convertWebPToImage(blob, format = 'image/png') {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((newBlob) => {
        URL.revokeObjectURL(url);
        resolve(newBlob);
      }, format);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error converting WebP to image'));
    };
    img.src = url;
  });
}

async function exportFolderByData(data) {
  const zip = new JSZip();
  const nameZip = document
    .querySelector('.WBVL_7 span')
    ?.textContent.replace(/ /g, '-');
  const comments = data
    .map((item) => item.comment)
    .filter((comment) => comment.trim() !== '') // Lọc các comment trống hoặc chỉ chứa khoảng trắng
    .join('\n');
  zip.file('comments.txt', comments);

  const folder = zip.folder('images');
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const subFolder = folder.folder(i + 1);

    // Lưu các liên kết vào subfolder tương ứng
    for (let j = 0; j < item.links.length; j++) {
      const objLink = item.links[j];
      const fileName = objLink.link.split('/').pop();
      const response = await fetch(objLink.link);
      const blob = await response.blob();
      // Chuyển đổi webp sang png (nếu cần)
      if (objLink.type === 'img' && fileName.endsWith('.webp')) {
        const imgBlob = await convertWebPToImage(blob, 'image/png');
        subFolder.file(fileName.replace('.webp', '.png'), imgBlob);
      } else {
        subFolder.file(fileName, blob);
      }
    }
  }

  return new Promise((resolve, reject) => {
    // Tạo tệp zip
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${nameZip}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      resolve(true);
    });
  });
}

async function executeLogic() {
  const getNextButton = () => {
    let nextButton = null;
    const listButtonNextPage = document.querySelectorAll(
      `.product-ratings__page-controller button`
    );

    listButtonNextPage.forEach((button, index) => {
      if (button.classList.contains('shopee-button-solid')) {
        if (
          listButtonNextPage[index + 1] &&
          +listButtonNextPage[index + 1].textContent !== 0
        ) {
          nextButton = listButtonNextPage[index + 1];
          return;
        }
      }
    });
    return nextButton;
  };
  const LIMIT_PAGE = 2;
  let isStop = false;
  let countError = 0;
  const dataExport = [];

  do {
    if (countError >= 3) {
      isStop = true;
    }
    try {
      const reviews = document.querySelectorAll(`.shopee-product-rating`);
      reviews.forEach((element) => {
        let comment = '';
        const elementComment = element.querySelectorAll(
          `[style="position: relative; box-sizing: border-box; margin: 15px 0px; font-size: 14px; line-height: 20px; color: rgba(0, 0, 0, 0.87); word-break: break-word; white-space: pre-wrap;"]`
        );

        elementComment.forEach((element) => {
          const isHaveSpan = element.querySelector('span');
          if (!isHaveSpan && element.textContent !== null) {
            comment += element.textContent;
          }
        });

        if (!comment) {
          const elementComment = element.querySelectorAll(
            `[style="position: relative; box-sizing: border-box; margin: 15px 0px; font-size: 14px; line-height: 20px; color: rgba(0, 0, 0, 0.87); word-break: break-word; white-space: pre-wrap;"] div`
          );
          elementComment.forEach((element) => {
            const isHaveSpan = element.querySelector('span');
            if (!isHaveSpan && element.textContent !== null) {
              comment += element.textContent;
            }
          });
        }

        const links = [];
        const elementLinks = element.querySelectorAll(
          `.rating-media-list .rating-media-list__zoomed-image ul >li`
        );
        elementLinks.forEach((elementLink) => {
          const isVideo = elementLink.querySelector('video');
          if (isVideo) {
            links.push({
              link: elementLink.querySelector('video').src,
              type: 'video',
            });
          } else {
            links.push({
              link: elementLink.querySelector('img').src,
              type: 'img',
            });
          }
        });

        if (comment || links.length > 0) {
          dataExport.push({
            comment,
            links,
          });
        }
      });

      const buttonNext = getNextButton();
      if (!buttonNext || buttonNext.textContent > LIMIT_PAGE) {
        isStop = true;
      }
      buttonNext.click();
      await wait(2000);
    } catch (error) {
      countError += 1;
    }
  } while (!isStop);

  await exportFolderByData(dataExport);
  chrome.runtime.sendMessage({ action: 'next' });
}
function getElementPosition(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  }
  return -1; // Trả về -1 nếu không tìm thấy phần tử
}

// Wait for the element with class "product-ratings__header_score"
waitForElement('.product-ratings__header_score', async () => {
  const elementPosition = getElementPosition('.product-ratings__header_score');
  if (elementPosition !== -1) {
    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
  }
  await executeLogic();
});
