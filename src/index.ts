/*
 *     该副本基于koishi框架,仅用于娱乐目的。
 *     Copyright (C) 2023-present yun
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Context, h, Schema} from "koishi"
import {} from 'koishi-plugin-puppeteer'

export const name: string = "chevereto"

export const using = ['puppeteer'] as const

export interface Config {
  cheveretoUrl: String,
  nsfw: Boolean,
  skipAlbums: [],
}

export const schema = Schema.object({
  cheveretoUrl: Schema.string()
    .description("chevereto的url地址")
    .default("https://image.yka.moe/"),
  nsfw: Schema.boolean()
    .description("是否开启nsfw，默认关闭")
    .default(false),
  skipAlbums: Schema.array(Schema.string())
    .description("nsfw相册映射,若开启nsfw，则该数组不使用")
    .default(["pixiv", "大腿的艺术", "泳装的艺术", "兔女郎的艺术", "足的艺术", "vtuber"]),

})

export async function apply(ctx: Context, config: Config) {

  ctx.command('chv <参数名称:string>', {"authority": 1})
    .option("nsfw", "-n", {authority: 2, fallback: false})
    .shortcut("不够涩", {options: {nsfw: true}})
    .action(async ({session, options}) => {

      const randomUrl: string = config.cheveretoUrl.toString() + '/?random'
      const skipAlbums: string[] = config.skipAlbums
      const approveNsfw: boolean = options.nsfw || config.nsfw.valueOf()

      const page = await ctx.puppeteer.page()

      try {
        // 先请求再说
        let nsfwFlag = false
        do {
          await page.goto(randomUrl, {
            waitUntil: 'domcontentloaded'//页面完全加载
          });

          // 是否跳过该相册
          // 获取相册id
          const albumHref: string = await page.$eval(`.description-meta.margin-bottom-20 a`, element => element.getAttribute("href"))
          // /album/ 是个魔法值  以后也许可以单独提出来
          const albumId: string = albumHref.replace("/album/", "")
          if (skipAlbums.includes(albumId)) { // 懂得都懂
            continue
          }

          // 判断是否允许nsfw
          if (approveNsfw) {// 允许则继续执行
            nsfwFlag = true
          } else {// 不允许则重复获取直到是sfw
            // 获取nsfw标记
            const imageId = await page.$eval(`.image-viewer-container img`, element => element.getAttribute("alt"))
            const unsafeString = await page.$eval(`.panel-thumb-list li a img[alt="${imageId}"]`, ele => ele.parentElement.parentElement.getAttribute('data-flag'))
            nsfwFlag = (unsafeString == "unsafe")
          }
        } while (nsfwFlag)

        // 获取图片地址
        const imageUrl = await page.$eval(".cursor-zoom-in", img => img.getAttribute('src'));

        // 好了 终于能发送图片了
        await session.send(h('image', {url: imageUrl}))

      } finally {
        // 避免puppeteer无限占用
        await page.close();
      }
    })
}
