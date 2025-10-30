import { ConflictException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDto } from "./dto/user.dto";
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

    public test() {
        console.log('test UserService object!')
    }

    public async getAllUsers() {
        try {        
            this.test();
            return {
                success: true,
                data: await this.userRepository.find({})
            } 
        }
        catch (error) {
            console.error('Error getAllUsers():', error);
            throw error;
        }
    }

    public async createUser(userDto: UserDto) {
        //check the email if already exist or not. If not then create
        const foundUser = await this.userRepository.findOneBy({email: userDto.email});

        if (!foundUser) {
            //Create User Object
            const user = this.userRepository.create({
                ...userDto,
                password: await bcrypt.hash(userDto.password, 10)
            });
            
            await this.userRepository.save(user);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, createdAt, updatedAt, deleteAt, ...result } = user;
            
            return result;

        } else {
            throw new ConflictException('User with this email already exists.');
        }
        
        
    }

    public async updateUser(id: string, userDto: UserDto){
        //Update User Object
        const user = await this.userRepository.findOneBy({id});
        if (user) {
            return await this.userRepository.update(id, userDto);
        } else {
            return null;
        }
        //Save the user object
        
    }

    public async deleteUser(id: string){

        //Delete user
        await this.userRepository.delete(id);

        //Send a response
        return {deleted: true }
    }

    public async findUserById(id: string){
        return await this.userRepository.findOneBy({ id })
    }

    public async findUserByEmail(email: string){
        return await this.userRepository.findOneBy({ email })
    }

}