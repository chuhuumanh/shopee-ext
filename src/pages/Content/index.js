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

async function executeLogic() {
  // do {
  let shopeeButtonIndex = -1;
  const LIMIT_PAGE = 10;

  do {
    // const dataExport = [];
    // const reviews = document.querySelectorAll(`.shopee-product-rating`);
    // reviews.forEach((element) => {
    //   const comment = element.querySelector(
    //     `[style="margin-top: 0.75rem;"]`
    //   )?.textContent;
    //   const links = [];
    //   const elementLinks = element.querySelectorAll(
    //     `.rating-media-list .rating-media-list__zoomed-image ul >li`
    //   );
    //   elementLinks.forEach((elementLink) => {
    //     const isVideo = elementLink.querySelector('video');
    //     if (isVideo) {
    //       links.push({
    //         link: elementLink.querySelector('video').src,
    //         type: 'video',
    //       });
    //     } else {
    //       links.push({
    //         link: elementLink.querySelector('img').src,
    //         type: 'img',
    //       });
    //     }
    //   });

    //   dataExport.push({
    //     comment,
    //     links,
    //   });
    // });
    // console.log(dataExport, 'dataExport');
    const listButtonNextPage = document.querySelectorAll(
      `.product-ratings__page-controller button`
    );
    listButtonNextPage.forEach((button, index) => {
      if (button.classList.contains('shopee-button-solid')) {
        shopeeButtonIndex = index;
        return;
      }
    });
    listButtonNextPage[shopeeButtonIndex + 1].click();
    await wait(1000);
    console.log(shopeeButtonIndex, 'shopeeButtonIndex');
  } while (shopeeButtonIndex <= LIMIT_PAGE);
  console.log('thoát khỏi con mập');

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
