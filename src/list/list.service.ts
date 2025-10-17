import { Injectable } from "@nestjs/common";
// import { AuthService } from "src/auth/auth.service";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ListDto } from "./dto/list.dto";
// import { Profile } from "src/profile/profile.entity";

@Injectable()
export class ListService{
    constructor(
        @InjectRepository(List)
        private listRepository: Repository<List>,
        // @InjectRepository(Profile)
        // private profileRepository: Repository<Profile>
    ){}

    async getAllList() {
        return {
            success: true,
            data: await this.listRepository.find({})
        }
        
    }

    public async createList(listDto: ListDto, userId: string){
        //Create list Object
        listDto.userId = userId;
        const list = this.listRepository.create(listDto);

        //Save the list object
        await this.listRepository.save(list);
        return {
            success: true
        }
    }

    public async updateList(id: string, listDto: ListDto){
        //Update list Object
        const list = await this.listRepository.findOneBy({id});
        if (list) {
            await this.listRepository.update(id, listDto);
            return {
                success: true
            }

        } else {
            return null;
        }
        //Save the list object
        
    }

    public async deleteList(id: string){

        //Delete list
        await this.listRepository.delete(id);

        //Send a response
        return {
            deleted: true,
            success: true
        }
    }

    public async findListById(id: string){
        return {
            success: true,
            data: await this.listRepository.findOneBy({ id })
        } 
    }
}