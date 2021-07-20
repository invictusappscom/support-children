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

    describe('testing donation...', () => {
        let campaigns

        describe('success', () => {
            beforeEach(async () => {
                await supportChildren.donate(0, 'donator@gmail.com', { value: 10 ** 16, from: user }) //0.01 ETH
            })

            it('amount should increase', async () => {
                expect(Number(await supportChildren.getCampaignAmount(0))).to.eq(10 ** 16)
            })
            
            it('total campaigns', async () => {
                campaigns = await supportChildren.getCampaigns()
                console.log(campaigns)
                expect(Number(campaigns.length)).to.eq(2)
            })

            it('name to be Loki', async () => {
                expect(String(campaigns[1].name)).to.eq('Loki')
            })
        })
    })
})