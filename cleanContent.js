// literally copy-pasted from eris
export default function cleanContent(message) {
    let cleanContent = message.content && message.content.replace(/<a?(:\w+:)[0-9]+>/g, "$1") || "";

    let authorName = message.author.username;
    if (message.channel.guild) {
        const member = message.channel.guild.members.get(message.author.id);
        if (member && member.nick) {
            authorName = member.nick;
        }
    }
    cleanContent = cleanContent.replace(new RegExp(`<@!?${message.author.id}>`, "g"), "@\u200b" + authorName);

    if (message.mentions) {
        message.mentions.forEach((mention) => {
            if (message.channel.guild) {
                const member = message.channel.guild.members.get(mention.id);
                if (member && member.nick) {
                    cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + member.nick);
                }
            }
            cleanContent = cleanContent.replace(new RegExp(`<@!?${mention.id}>`, "g"), "@\u200b" + mention.username);
        });
    }

    if (message.channel.guild && message.roleMentions) {
        for (const roleID of message.roleMentions) {
            const role = message.channel.guild.roles.get(roleID);
            const roleName = role ? role.name : "deleted-role";
            cleanContent = cleanContent.replace(new RegExp(`<@&${roleID}>`, "g"), "@\u200b" + roleName);
        }
    }

    message.channelMentions.forEach((id) => {
        const channel = message._client.getChannel(id);
        if (channel && channel.name && channel.mention) {
            cleanContent = cleanContent.replace(channel.mention, "#" + channel.name);
        }
    });

    return cleanContent.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
}