import * as fs from 'fs';

import { Client, User, Webhook } from 'eris';

import { discordInfoPath } from './path';

export interface DiscordInfo {
    noticeChannelId?: string;
    linkedChannels: { [fromId: string]: string[]; };
    webhookIds: { [channelId: string]: Webhook };
}

export function getAvatarUrl(user: User) {
    const hash = user.avatar || user.defaultAvatar;
    return `https://cdn.discordapp.com/avatars/${user.id}/${hash}.png`;
}

export async function saveDiscordInfo(discord: DiscordInfo) {
    await fs.promises.writeFile(discordInfoPath, JSON.stringify(discord), { encoding: 'utf8', mode: 0o600 });
}

export function getLinkedChannels(discord: DiscordInfo, channelId: string) {
    if (channelId in discord.linkedChannels) {
        return [...discord.linkedChannels[channelId]];
    }
    return [];
}

export async function getOrCreateChannelWebhook(bot: Client, discord: DiscordInfo, channelId: string): Promise<Webhook> {
    if (channelId in discord.webhookIds) {
        return discord.webhookIds[channelId];
    }
    const webhook =
        await bot.createChannelWebhook(channelId, { name: '루미나 브릿지', avatar: '' }, '루미나 브릿지 연결');
    discord.webhookIds[channelId] = webhook;
    await saveDiscordInfo(discord);
    return webhook;
}
