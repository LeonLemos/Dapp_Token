const {expect} = require ('chai'); 
const {ethers} = require('hardhat');

const tokens = (n)=> {
    return ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Token',()=> {

    let token, accounts, deployer, receiver, exchange

    beforeEach( async ()=>{
        //Fetch Token from blockchain
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Dapp University','DAPP','1000000')

        //Fetch Accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]

    })

    describe ('Deployment',()=>{
        const name = 'Dapp University';
        const symbol = 'DAPP';
        const decimals = '18';
        const totalSupply = tokens('1000000');
    
        it('has correct name', async ()=>{
            //Check that name is correct
            expect(await token.name()).to.equal(name)
        })
    
        it('has correct symbol', async ()=>{
            //Check that symbol is correct
            expect(await token.symbol()).to.equal(symbol)          
        })
    
        it('has correct decimals', async ()=>{   
            //Check that decimals are correct
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('has correct supply', async ()=>{
            //Check that supply is correct
            //const value = tokens('1000000')
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns supply to deployer', async ()=>{   
            //Check that decimals are correct
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })

    })

    describe ('Sending Tokens',()=>{

        let amount, transaction, result

        describe ('Success',()=>{

            beforeEach(async()=>{
                amount = tokens(100)
                //Transfer tokens
                transaction = await token.connect(deployer).transfer(receiver.address ,amount)
                result = await transaction.wait()
            })
    
            it('Transfer token balances', async ()=>{
                //Log Balance before Transfer 
                //console.log("deployer balance before transfer", await token.balanceOf(deployer.address))
                //console.log("receiver balance before transfer", await token.balanceOf(receiver.address))
                
                //Ensure tokens were transfered(balance change)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
    
                //Log Balance before Transfer
                //console.log("deployer balance before transfer", await token.balanceOf(deployer.address))
                //console.log("receiver balance before transfer", await token.balanceOf(receiver.address))
            
            })
    
            it('Emits a transfer event', async()=>{
                const event = result.events[0]
                //console.log(event)
                expect(event.event).to.equal("Transfer")
    
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })

        })

        describe ('Failure',()=>{
            it('Rejects insufficient balances',async()=>{
                //Transfer more tokens than deployer has
                const invalidAmount = tokens(100000000)
                await expect(token.connect(deployer).transfer(receiver.address ,invalidAmount)).to.be.reverted
            })

            it('Rejects invalid recipient',async()=>{
                //Transfer more tokens than deployer has
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })   
    }) 

    describe ('Approving Tokens', ()=>{
        let amount, transaction, result

        beforeEach(async()=>{
            amount = tokens(100)
            //Transfer tokens
            transaction = await token.connect(deployer).approve(exchange.address ,amount)
            result = await transaction.wait()
        })

        describe ('Success', ()=>{
            it('Allocates an allowance for delegated token spending', async ()=>{
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount) 
            })

            it('Emits an approval event', async()=>{
                const event = result.events[0]
                //console.log(event)
                expect(event.event).to.equal("Approval")
    
                const args = event.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount)
            })
        })


        describe('Failure', ()=>{
            it('Rejects invalid spender',async ()=>{
                await expect (token.connect(deployer).approve('0x0000000000000000000000000000000000000000',amount)).to.be.reverted
            })

        })
    })

    describe ('Delegated token transfers',()=>{
        let amount, transaction, result

        beforeEach(async()=>{
            amount = tokens(100)
            //Transfer tokens
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })

        describe ('Success',()=>{
            beforeEach(async()=>{
                //Transfer tokens
                transaction = await token.connect(exchange).transferfrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            })
            
            it('Transfer token balances', async ()=>{
                expect( await token.balanceOf(deployer.address)).to.be.equal(ethers.utils.parseUnits('999900','ether'))
                expect( await token.balanceOf(receiver.address)).to.be.equal(amount)
            })

            it('Resets the allowance',async ()=>{
                expect(await token.allowance(deployer.address, exchange.address)).to.be.equal(0)
            })

            it('Emits a transfer event', async()=>{
                const event = result.events[0]
                //console.log(event)
                expect(event.event).to.equal("Transfer")
    
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe ('Failure', async ()=>{
            it('Rejects insufficient amounts', async()=>{
            const invalidAmount = tokens (1000000)
            await expect(token.connect(exchange).transferfrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            }) 
            
        })   
    })
})