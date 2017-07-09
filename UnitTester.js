import phantom from 'phantom'
import { testServer } from 'GlobalConfig'




const UnitTester = {
  PhantomTester: {
    create(url = testServer) {
      let phInstance
      let sitePage
      return phantom.create()
        .then(instance => {
          phInstance = instance;
          return instance.createPage();
        })
        .then(page => {
          // use page 
          sitePage = page
          return page.open(url)
        })
        .then(status => {
          return Promise.resolve({
            page: sitePage, 
            instance: phInstance
          })
        })
        .catch(error => {
          console.log(error);
          phInstance.exit();
        })
    }
  }

}
module.exports = UnitTester