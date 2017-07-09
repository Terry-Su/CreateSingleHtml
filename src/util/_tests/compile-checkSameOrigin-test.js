import { server, testServer } from 'GlobalConfig'
import { PhantomTester } from 'UnitTester'

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000

describe('Test fn: CheckSameOrigin: ', () => {
  it('Url with different origin', done => {
    let phInstance
    PhantomTester.create()
      .then(({
        page,
        instance
      }) => {
        phInstance = instance
        return page.evaluate(() => window.UnitTest.checkSameOrigin('http://localhost:3846'))
      })
      .then(value => {
        expect(value).toEqual(false)
      })
      .then(() => {
        phInstance.exit()
        done()
      })
  })

  it('Url with same origin', done => {
    let phInstance
    PhantomTester.create()
      .then(({
        page,
        instance
      }) => {
        phInstance = instance
        return page.evaluate(() => window.UnitTest.checkSameOrigin(window.location.origin + '/test'))
      })
      .then(value => {
        expect(value).toEqual(true)
      })
      .then(() => {
        phInstance.exit()
        done()
      })
  })
})