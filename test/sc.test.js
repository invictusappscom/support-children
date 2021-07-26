const SupportChildren = artifacts.require('./SupportChildren')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('SupportChildren', ([deployer, user]) => {
    let supportChildren
    beforeEach(async () => {
        supportChildren = await SupportChildren.new()
        // await supportChildren.deposit({value: 10**16, from: user})
        await supportChildren.createCampaign('Dora', 'Da ne ujeda', 'zarej@svrljig.net', '', 100, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
        await supportChildren.createCampaign('Loki', 'Da ne bezi', 'nemanja@svrljig.net', '', 100, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
    })

    describe('testing getters...', () => {
        beforeEach(async () => {
            campaignsLenght = (await supportChildren.getCampaigns()).length
            await supportChildren.donate(1, 'donator@gmail.com', { value: 10 ** 16, from: user }) //0.01 ETH
        })

        it('get donor emails', async () => {
            expect((await supportChildren.getDonorEmails(1))[0]).to.eq('donator@gmail.com')
        })
        
        it('get current amount', async () => {
            expect(Number(await supportChildren.getCampaignAmount(1))).to.eq(10 ** 16)
        })

        it('get donor list', async () => {
            expect(Number((await supportChildren.getDonorsCampaingsList(user)).length)).to.gt(0)
        })

        it('get campaigns', async () => {
            await supportChildren.createCampaign('Child3', 'Desc', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83', { from: user })
            expect(Number((await supportChildren.getCampaigns()).length)).to.eq(campaignsLenght + 1)
        })
    })
    
    describe('testing campaign...', () => {
        describe('success', async () => {
            beforeEach(async () => {
                campaignsLenght = (await supportChildren.getCampaigns()).length
            })
            it('campaign created', async () => {
                await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght + 1)
                expect(campaigns[campaignsLenght].name).to.eq('Child')
                expect(campaigns[campaignsLenght].description).to.eq('Final')
                expect(campaigns[campaignsLenght].creatorEmail).to.eq('zarej@svrljig.net')
                expect(campaigns[campaignsLenght].image).to.eq('http://www.example.com/image.jpg')
                expect(campaigns[campaignsLenght].beneficiaryAddress).to.eq('0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
                expect(campaigns[campaignsLenght].targetAmount).to.eq("1001")
                expect(campaigns[campaignsLenght].currentAmount).to.eq("0")
                expect(campaigns[campaignsLenght].active).to.eq(true)
            })


            it('campaign ended', async () => {
                await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
                let result = await supportChildren.endCampaign(campaignsLenght)
                campaigns = await supportChildren.getCampaigns()
                expect(campaigns[campaignsLenght].active).to.eq(false)

                const event = result.logs[0].args
                expect(Number(event.campaignId)).to.eq(campaignsLenght)
                expect(Number(event.currentAmount)).to.eq(0)
                expect(Number(event.notifyEmails.length)).to.eq(0)
            })

        })
        
        describe('failure', async () => {
            let campaigns
            beforeEach(async () => {
                campaignsLenght = (await supportChildren.getCampaigns()).length
            })
            
            it('creation failed after 0 target amount', async () => {
                try {
                    await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 0, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83')
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, "campaign target amount must be larger than 0");
                }
            })

            it('creation failed after bad address', async () => {
                try {
                    await supportChildren.createCampaign('Child', 'Final', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1110, '0x8B0ca6197cEdF0B83')
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, 'Error: invalid address (argument="address", value="0x8B0ca6197cEdF0B83", code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_beneficiaryAddress", value="0x8B0ca6197cEdF0B83", code=INVALID_ARGUMENT, version=abi/5.0.7)');
                }
            })

            it('ending campaign', async () => {
                await supportChildren.createCampaign('Child2', 'Desc', 'zarej@svrljig.net', 'http://www.example.com/image.jpg', 1001, '0x8B24BA3Aa2505AbB0f9086fa50ca6197cEdF0B83', { from: user })
                campaigns = await supportChildren.getCampaigns()
                expect(Number(campaigns.length)).to.eq(campaignsLenght + 1)
                
                try {
                    await supportChildren.endCampaign(campaignsLenght, { from: deployer })
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, 'you must be creator of campaign to close it');
                }

                // close campaign
                await supportChildren.endCampaign(campaignsLenght, { from: user })
                campaigns = await supportChildren.getCampaigns()
                expect(campaigns[campaignsLenght].active).to.eq(false)

                // try to close it again
                try {
                    await supportChildren.endCampaign(campaignsLenght, { from: user })
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, 'campaings in finished');
                }
            })
        })
    })

    describe('testing donation...', async () => {
        describe('success', () => {
            let result

            beforeEach(async () => {
                result = await supportChildren.donate(0, 'donator@gmail.com', { value: 10 ** 16, from: user }) //0.01 ETH
            })
            
            it('current amount should increase', async () => {
                expect(Number(await supportChildren.getCampaignAmount(0))).to.eq(10 ** 16)
            })

            it('donation event should be emmited', async () => {
                const event = result.logs[0].args
                expect(Number(event.campaignId)).to.eq(0)
                expect(Number(event.donationAmount)).to.eq(10 ** 16)
                expect(event.notifyEmail).to.eq('zarej@svrljig.net')
            })
        })

        describe('failure', async () => {
            beforeEach(async () => {
                amountBefore = await supportChildren.getCampaignAmount(0)
            })

            it('not enough eth', async () => {
                try {
                    await supportChildren.donate(0, 'donator@gmail.com', { value: 0, from: user }) //0.0 ETH
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, 'donation must be larger than 0');
                }
            })

            it('campaign closed', async () => {
                await supportChildren.endCampaign(0)
                try {
                    await supportChildren.donate(0, 'donator@gmail.com', { value: 10, from: user })
                } catch (error) {
                    assert.throws(() => { throw new Error(error) }, Error, 'campaign is not active');
                }
            })
        })
    })
    
})