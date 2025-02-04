# Trả lời câu hỏi Lab 5

## 1. Truffle sẽ deploy các smart contract này trên network nào (mainnet, ropsten, …) và cấu hình địa chỉ ra sao?
Theo config trong file truffle-config.js, truffle sẽ deploy các smart contract này lên network local, và cấu hình địa chỉ như sau

```javascript
{
    development: {
        host: "127.0.0.1", // Localhost (default: none)
        port: 7545, // Standard Ethereum port (default: none)
        network_id: "*", // Any network (default: none)
    },
}
```

Tuy nhiên, truffle có thể deploy các smart contract này lên các mạng khác một cách dễ dàng bằng cách config thêm networks trong file truffle-config.js

Các mạng khả dụng và có mẫu sẵn là: ethereum, ropsten, mainet,... 

## 2. Phiên bản compilers được dùng để compile smart contract? Các phiên bản compiler sau, phiên bản nào có thể build được smart contract mà không bị lỗi: 0.6.0, 0.7.0, 0.8.0, 0.8.13. 
- Phiên bản compilers được sử dụng để compile là: 0.8.13, được define trong truffle-config.js
- Tất cả các phiên bản compilers 0.6.0, 0.7.0, 0.8.0, 0.8.13 đều có thể build được smart contract mà không bị lỗi. Do các compiler này đều thỏa mãn điều kiện được define trong smart contract

## 3. Bytecode sau khi compile smart contract nằm ở đâu?
- Trong thư mục `build/contracts`.
- Mối file .json đều tương ứng với một smart contract tương ứng, bên trong file json có trường `"bytecode"` chứa thông tin bytecode tương ứng. 

## 4. Token sau khi deploy có tên là gì? Mã là gì? Số lượng khởi tạo bao nhiêu?
```javascript
deployer.deploy(erc20Token, 10000, "TotalSem Token", 18, "TotalSem");
```
Từ code này trong file migration thì
- Tên token: `TotalSem Token`
- Mã: `TotalSem`
- Số lượng: `10000`

## 5. Trong smart contract ERC20Token, các biến và function sau dùng để làm gì: totSupply, name, decimals, symbol, balances, allowed, totalSupply(), balanceOf(), allowance(), transfer(), transferFrom(), approve().  
- totSupply: Tổng số lượng token
- name: tên đầy đủ của token
- decimals: Số lượng chữ số thập phân mà token hỗ trợ
- symbol: ký hiệu token
- balances: số dư của mỗi address
- allowed: mapping để định nghĩa giới hạn token mà một tài khoản được phép chuyển đến một tài khoản khác.

- totalSupply(): hàm trả về tổng số lượng token trong hệ thống
- balanceOf(): hàm trả về giá trị số dư token của tài khoản có địa chỉ được truyền vào
- allowance(): hàm trả về giá trị mà 1 tài khoản được phép chi trả cho bên nhận chi trả.
- transfer(): hàm cho phép chuyển token từ msg.sender đến một tài khoản xác định.
- transferFrom(): chuyển token từ 1 tài khoản xác định đến 1 tài khoản xác định khác (chuyển thay mặt người khác).
- approve(): hàm ghi giá trị token người sở hữu cho phép chi trả vào mapping allowed

## 6. Trong smart contract SupplyChain, các biến và function sau dùng để làm gì: product_id, participant_id, owner_id, addParticipant(), getParticipant(), addProduct(), getProduct(), newOwner(), getProvenance(), getOwnership(), authenticateParticipant().
- product_id: mã hàng hóa duy nhất dùng để xác định hàng hóa trong danh sách hàng hóa
- participant_id: mã bên tham gia duy nhất, dùng để xác định bên tham gia trong danh sách
- owner_id: mã sở hữu duy nhất
- addParticipant(): thêm bên tham gia
- getParticipant(): lấy thông tin về bên tham gia được chỉ định
- addProduct(): thêm hàng hóa
- getProduct(): lấy thông tin về hàng hóa được chỉ định
- newOwner(): chuyển quyền sở hữu
- getProvenance(): lấy lịch sử thay đổi quyền sở hữu
- getOwnership(): lấy thông tin quyền sở hữu tại 1 thời điểm
- authenticateParticipant(): cho phép 1 bên liên quan được truy cập vào dữ liệu liên quan