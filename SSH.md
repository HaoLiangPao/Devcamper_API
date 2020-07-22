# SSH basics

## Login with password

`ssh brad@192.168.1.299`

1. install web app (so that we can access the server from the browser with the IP address)

   `sudo apt install apache2 -y`

   `apt`: package management tool

   **Could be any server, MEAN, Django etc...**

## Login with SSH keys

`ssh-keygen`

1. Can change the name of the `private_key` and `public_key`
2. Can add `passphrase`



## Example: Login to a server hosted remotly

1.Create a seperate key-pairs for different purposes

2.When you generate a new pair of keys, you need to add the identity (for example `id_rsa_do` for digital ocean)

​	`ssh-add ~/.ssh/id_rsa_do`



## Example: Add SSH key to Server (to work with Github SSH login)

1. Change the ownership of .`ssh` folder to user `hao`
   1. Check ownership of the folder
      1. `ls -la`
   2. Change the ownership of the folder
      1. `sudo chown -R hao:hao /home/hao`
      2. User: hao; group: hao

2. Generate SSH key pair for github

   1. `ssh-keygen -t rsa`
   2. In this example, we name it `id_rsa_github`

3. Add SSH key pair at Github Account

4. Add identity of SSH key pair at server

   1. `ssh-add /home/hao/.ssh/id_rsa_github`

5. [if *Could not open a connection to your authentication agent.*]

   1. `eval 'ssh-agent -s'` (use backticks around ssh-agent -s)
   2. Create a ssh agent so that we can then add identity

   ## Tips about using Server:

Commands should be run every time working with a server

1. `sudo apt update`: take all the packages it installed and update them to the latest version
2. `sudo apt upgrade`: upgrade the software

**Never use the root user, always create users and then authorize it; It is also better to disable the root login**

1. Add user:
   1. `adduser hao`: add a user to the server
   2. it also creates a folder with name of **user_id** under `/home` folder
2. Check user:
   1. `id hao`: check user with id of **hao**
3. Add sudo previlage
   1. `usermod -aG sudo hao`: add sudo previlage to user with id of **hao**
4. Add SSH key pairs for the specific user
   1. Create `.ssh` folder in the user folder under `home`
      1. `cd /home/hao`
      2. `mkdir .ssh`
   2. Create `authorized_keys` file in the .`ssh` folder
      1. `touch authorized_keys`
      2. `sudo nano authorized_keys`
5. Disable root user login
   1. `sudo nano /etc/ssh/sshd_config`: change the config file
      1. change **PermitRootLogin** to **no**
   2. `sudo systemctl reload sshd`: reload sshd from the server







## Tips:

1. port 21: FTP
2. port 22: SSH









