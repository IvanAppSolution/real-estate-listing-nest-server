import { ConflictException, Injectable } from "@nestjs/common";
// import { AuthService } from "src/auth/auth.service";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDto } from "./dto/user.dto";
import bcrypt from 'bcryptjs';
import { JwtService } from "@nestjs/jwt";
// import { Profile } from "src/profile/profile.entity";

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
        // @InjectRepository(Profile)
        // private profileRepository: Repository<Profile>
    ){}

    getAllUsers(): Promise<User[]>{
        return this.userRepository.find({})
    }

    public async createUser(userDto: UserDto) {
        //check the email if already exist or not. If not then create
        const user = await this.userRepository.findOneBy({email: userDto.email});

        if (!user) {
            //Create User Object
            const user = this.userRepository.create(userDto);
            const hashedPassword = await bcrypt.hash(user.password, 10)
            user.password = hashedPassword;

            await this.userRepository.save(user);

            const payload = { userId: user.id, username: user.username };

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            
            return { 
                token: await this.jwtService.signAsync(payload,{expiresIn: '7d'}),
                user: result,
                success: true
            }

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

    public async findUserByEmal(email: string){
        return await this.userRepository.findOneBy({ email })
    }

}