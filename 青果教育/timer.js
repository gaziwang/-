async function rquestUnit(tag, encod, url, data) {
  console.log('fetch.....')
  let formatText = (text, encoding) => {
    return new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = (event) => {
        resolve(fr.result)
      }

      fr.onerror = (err) => {
        reject(err)
      }

      fr.readAsText(text, encoding)
    })
  }
  return await fetch(url, {
    method: tag,
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((rp) => rp.blob().then((v) => formatText(v, encod)))
    .then((v) => v)
    .catch((er) => er)
}

async function scheduleTimer() {
  // 内嵌loadTool工具，传入工具名即可引用公共工具函数(暂未确定公共函数，后续会开放)
  // await loadTool('AIScheduleTools')
  // const { AIScheduleAlert } = AIScheduleTools()
  // // 只要大声喊出 liuwenkiii yyds 就可以保你代码不出bug
  // await AIScheduleAlert('liuwenkiii yyds!')
  // // 支持异步操作 推荐await写法
  // const someAsyncFunc = () => new Promise(resolve => {
  //   setTimeout(() => resolve(), 100)
  // })
  // await someAsyncFunc()
  // 返回时间配置JSON，所有项都为可选项，如果不进行时间配置，请返回空对象

  try {
    let info = JSON.parse(
      await rquestUnit('post', 'gbk', '/xjdxjw/jw/common/showYearTerm.action')
    )

    let infos = await rquestUnit(
      'post',
      'gbk',
      '/xjdxjw/public/SchoolTimetable.show.jsp?random=' + Math.random(),
      'xn=' +
        info.xn +
        '&xq_m=' +
        info.xqM +
        '&sel_xn_xq=' +
        info.xn +
        '-' +
        info.xqM +
        '&btnQry=%BC%EC%CB%F7&btnPreview=%B4%F2%D3%A1&menucode_current='
    )
    console.log(infos)
    let doms = new DOMParser().parseFromString(infos, 'text/html')
    let tabs = doms.getElementsByTagName('tbody')[0]
    let trs = tabs.getElementsByTagName('tr')
    let times = []
    for (const tr in trs) {
      if (Object.hasOwnProperty.call(trs, tr)) {
        const element = trs[tr]
        let tds = element.getElementsByTagName('td')
        times.push({
          section: tds[0].innerText.replace(/\n|\t/g, ''),
          startTime: tds[1].innerText.replace(/\n|\t/g, ''),
          endTime: tds[2].innerText.replace(/\n|\t/g, ''),
        })
      }
    }
    // console.log(times)
    // console.log(trs)
    return {
      totalWeek: 24, // 总周数：[1, 30]之间的整数
      startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
      startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
      showWeekend: false, // 是否显示周末
      forenoon: 5, // 上午课程节数：[1, 10]之间的整数
      afternoon: 4, // 下午课程节数：[0, 10]之间的整数
      night: times.length - 9, // 晚间课程节数：[0, 10]之间的整数
      sections: times, // 课程时间表，注意：总长度要和上边配置的节数加和对齐
    }
  } catch (e) {
    console.error(e)
    return {}
  }
}
