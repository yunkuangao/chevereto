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

// todo 还没时间写测试，先留着吧

import { Context } from 'koishi'
import mock from '@koishijs/plugin-mock'

const app = new Context()
app.plugin(mock)

// 创建一个 userId 为 123 的私聊客户端
const client = app.mock.client('123')

// 这是一个简单的中间件例子，下面将测试这个中间件
app.middleware(({ content }, next) => {
  if (content === '天王盖地虎') {
    return '宝塔镇河妖'
  } else {
    return next()
  }
})

// 这一句不能少，要等待 app 启动完成
before(() => app.start())
after(() => app.stop())

it('example 1', async () => {
  // 将“天王盖地虎”发送给机器人将会获得“宝塔镇河妖”的回复
  await client.shouldReply('天王盖地虎', '宝塔镇河妖')

  // 将“天王盖地虎”发送给机器人将会获得某些回复
  await client.shouldReply('天王盖地虎')

  // 将“宫廷玉液酒”发送给机器人将不会获得任何回复
  await client.shouldNotReply('宫廷玉液酒')
})
