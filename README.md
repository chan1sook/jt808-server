# JT/T808 Server

JT/T808 Server with Protocol Parser

## Features
- Customize JT/T808 Server port (default: 7999)
- Support read protocol from device
    > Use net.Socket from connection event from write data
- Custom Server events eg.
    - connection
    - raw_data (Raw data from device)
    - data (Parsed data from Parser)
    - disconnected
- Bundle with JT/T808 Protocol Parser
    - Currently support Location Report Data only

> ___Warning___
This Library is in alpha. Bugs and missing features are unexpected!

## TODO
- Server
    - [ ] Write protocol back to device (.send())
       
- Protocol Parser
    - [ ] Support more message type
    - [ ] Protocol builder