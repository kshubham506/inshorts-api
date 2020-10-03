const axios = require('axios')
const debug = require('debug')('app')
const cheerio = require('cheerio');
const _ = require('lodash')

async function fetchNews(language = 'en', category = '') {
    const response = {
        'success': true,
        'category': category,
        'data': []
    }
    try {
        const respData = await axios.get(`https://www.inshorts.com/${language}/read/${category}`)
        const $ = cheerio.load(respData.data)
        const newsCards = $('.news-card')

        if (!newsCards || _.keys(newsCards).length === 0) {
            response['success'] = false
            response['errorMessage'] = 'Invalid Category'
            return response
        }


        const news = []
        newsCards.each((i, element) => {
            const $element = $(element);

            const newsObject = {
                'title': '',
                'imageUrl': '',
                'url': '',
                'content': '',
                'author': '',
                'date': '',
                'time': '',
                'readMoreUrl': ''
            }

            try {
                const $title = $element.find('div.news-card-title a.clickable span')
                newsObject.title = $title.text()
            } catch (err) { }


            try {
                const $imageUrl = $element.find('div.news-card-image')
                const u = $($imageUrl[0]).css('background-image')
                newsObject.imageUrl = u.substring(u.indexOf('\'') + 1, u.lastIndexOf('\''))
            } catch (err) { }


            try {
                const $url = $element.find('div.news-card-title a')
                const url = $($url[0]).attr('href')
                newsObject.url = `https://www.inshorts.com/${url}`
            } catch (err) { }


            try {
                const $content = $element.find('div.news-card-content div')
                newsObject.content = $content.text()
            } catch (err) { }


            try {
                const $author = $element.find('div.news-card-title div.news-card-author-time span.author')
                newsObject.author = $author.text()
            } catch (err) { }

            try {
                const $date = $element.find('div.news-card-title div.news-card-author-time')
                newsObject.date = $date.children().last().text()
            } catch (err) { }

            try {
                const $time = $element.find('div.news-card-title div.news-card-author-time span.time')
                newsObject.time = $time.text()
            } catch (err) { }


            try {
                const $readMore = $element.find('div.news-card-footer div.read-more a')
                newsObject.readMoreUrl = $($readMore[0]).attr('href')
            } catch (err) { }

            news.push(newsObject)

        })


        response['data'] = news
        return response

    } catch (error) {
        debug('error while fetching news', error)
        response['success'] = false
        response['errorMessage'] = error.message
        return response
    }
}


process.on('unhandledRejection', error => {
    debug('unhandledRejection', error.message);
})



