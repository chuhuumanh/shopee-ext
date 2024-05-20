const selectors = {};

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
  const folderName = document
    .querySelector('.WBVL_7 span')
    ?.textContent.replace(/ /g, '-');
  const LIMIT_PAGE = 5;
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
          `[style="position: relative; box-sizing: border-box; margin: 15px 0px; font-size: 14px; line-height: 20px; color: rgba(0, 0, 0, 0.87); word-break: break-word; white-space: pre-wrap;"] div`
        );

        elementComment.forEach((element) => {
          const isHaveSpan = element.querySelector('span');
          if (!isHaveSpan && element.textContent !== null) {
            comment += element.textContent;
          }
        });

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
      await wait(1500);
    } catch (error) {
      countError += 1;
    }
  } while (!isStop);

  console.log(dataExport);
  // chrome.runtime.sendMessage({ action: 'next' });
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
