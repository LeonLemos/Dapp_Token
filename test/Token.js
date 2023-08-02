const {expect} = require ('chai'); 
const {ethers} = require('hardhat');

const tokens = (n)=> {
    return ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Token',()=> {

    let token 

    beforeEach( async ()=>{
        //Fetch Token from blockchain
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Dapp University','DAPP','1000000')

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

    })

    
})