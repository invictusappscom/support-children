const SupportChildren = artifacts.require('./SupportChildren')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('SupportChildren', ([deployer, user]) => {
    beforeEach(async () => {
        supportChildren = await SupportChildren.new()
        // await supportChildren.deposit({value: 10**16, from: user})
        await supportChildren.createCampaign('Dora', 'Da ne ujeda', 'zarej@svrljig.net', 100, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
        await supportChildren.createCampaign('Loki', 'Da ne bezi', 'nemanja@svrljig.net', 100, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
    })

    describe('testing getters...', () => {
        beforeEach(async () => {
            campaignsLenght = await supportChildren.getCampaigns().length
            await supportChildren.donate(1, 'donator@gmail.com', { value: 10 ** 16, from: user }) //0.01 ETH
        })

        it('get donor emails', async () => {
            expect(await supportChildren.getDonorEmails(1)[0]).to.eq('donator@gmail.com')
        })
        
        it('get current amount', async () => {
            expect(Number(await supportChildren.getCampaignAmount(0))).to.eq(10 ** 16)
        })

        it('get donor list', async () => {
            expect(Number(await supportChildren.getDonorsCampaingsList(user).length)).to.gt(0)
        })

        it('get campaigns', async () => {
            await supportChildren.createCampaign('Child3', 'Desc', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83', { from: user })
            expect(Number(await supportChildren.getCampaigns().length)).to.eq(campaignsLenght + 1)
        })
    })
    
    describe('testing campaign...', () => {
        describe('success', () => {
            campaignsLenght = await supportChildren.getCampaigns().length
            await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
            
            it('campaign created', async () => {
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght + 1)
                expect(campaigns[campaignsLenght].name).to.eq('Child')
                expect(campaigns[campaignsLenght].description).to.eq('Final')
                expect(campaigns[campaignsLenght].creatorEmail).to.eq('zarej@svrljig.net')
                expect(campaigns[campaignsLenght].image).to.eq('http://www.example.com/image.jpg')
                expect(campaigns[campaignsLenght].beneficiaryAddress).to.eq('0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
                expect(campaigns[campaignsLenght].targetAmount).to.eq(1001)
                expect(campaigns[campaignsLenght].currentAmount).to.eq(0)
                expect(campaigns[campaignsLenght].active).to.eq(true)
            })

            await supportChildren.endCampaign(campaignsLenght)
            it('campaign ended', async () => {
                expect(campaigns[campaignsLenght].active).to.eq(false)
            })

        })
        
        describe('failure', () => {
            let campaigns
            campaignsLenght = await supportChildren.getCampaigns().length
            await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 0, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
            
            it('total campaigns not increased after 0 target amount', async () => {
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght)
            })

            await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1110, '0x8B0ca6197cEdF0B83')
            
            it('total campaigns not increased campaign after bad address', async () => {
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght)
            })

            it('ending campaign', async () => {
                await supportChildren.createCampaign('Child2', 'Desc', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83', { from: user })
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght + 1)
                
                await supportChildren.endCampaign(campaignsLenght+1, { from: deployer })
                campaigns = await supportChildren.getCampaigns()
                expect(campaigns[campaignsLenght].active).to.eq(true)
            })
        })
    })

    describe('testing donation...', () => {
        describe('success', () => {
            beforeEach(async () => {
                await supportChildren.donate(0, 'donator@gmail.com', { value: 10 ** 16, from: user }) //0.01 ETH
            })

            it('current amount should increase', async () => {
                expect(Number(await supportChildren.getCampaignAmount(0))).to.eq(10 ** 16)
            })
        })

        describe('failure', () => {
            amountBefore = await supportChildren.getCampaignAmount(0)
            await supportChildren.donate(0, 'donator@gmail.com', { value: 0, from: user }) //0.0 ETH

            it('amount should not increase', async () => {
                expect(Number(await supportChildren.getCampaignAmount(0))).to.eq(amountBefore)
            })
        })
    })
    
})